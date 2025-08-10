import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { User } from "../entity/User";
import { pokemonService } from "./PokemonService";
import { Pokemon } from "../entity/Pokemon";
import { GameLevel } from "../entity/GameLevel";
import { GameLevelPokemons } from "../entity/GameLevelPokemons";
import { userService } from "./UserService";
import { Movement } from "../entity/Movement";
import { TrainerPokemon } from "../entity/TrainerPokemon";
import { typeInteractionService } from "./TypeInteractionService";
import { teamService } from "./TeamService";
import { AccessoriesEnum } from "../constants/accesories";
import { BadgesEnum } from "../constants/badges";
import { LeagueLevel } from "../entity/LeagueLevel";
import { leagueLevelService } from "./LeagueLevelService";
import { leagueService } from "./LeagueService";
import { Team } from "../entity/Team";
import { LeagueTeam } from "../entity/LeagueTeam";

interface UpdatePlayData {
  gameLevelId: number;
  currentPokemonId: number;
  movementUsedTypeId?: number;
  enemyPokemonId: number;
  pokemonChangedId?: number;
  pokemonChangeDefeatId?: number;
  league: boolean;
  surrender: boolean;
}

interface UpdatedPlayData {
  remainingMoves: Movement[];
  damageCausedString: string;
  criticalCaused: boolean;
  damageCaused: number;
  attackCaused: number;
  currentPokemonPs: number;
  damageReceivedString: string;
  criticalReceived: boolean;
  damageReceived: number;
  attackReceived: number;
  enemyPokemonPs: number;
  firstAttacker: string;
}

interface AttackResult {
  damageMultiplier?: number;
}

interface PlayerAttackResult extends AttackResult {
  damageCaused?: number;
  criticalCaused?: boolean;
}

interface EnemyAttackResult extends AttackResult {
  damageReceived?: number;
  attackReceived?: number;
  criticalReceived?: boolean;
}

export interface Accessory {
  id: string;
  unlocked: number;
}

export interface Accessories {
  handAccessories: Accessory[];
  headAccessories: Accessory[];
  feetAccessories: Accessory[];
  mouthAccessories: Accessory[];
  eyesAccessories: Accessory[];
}

export class GameLevelService {
  private gameLevelRepository = AppDataSource.getRepository(GameLevel);
  private leagueLevelRepository = AppDataSource.getRepository(LeagueLevel);
  private gameLevelPokemonRepository =
    AppDataSource.getRepository(GameLevelPokemons);
  private trainerPokemonRepository =
    AppDataSource.getRepository(TrainerPokemon);
  private userRepository = AppDataSource.getRepository(User);

  private pokemonArrays: { [key: number]: Pokemon[] } = {};

  async getGameLevelsByUser(userId: number) {
    return this.gameLevelRepository.find({
      where: { user: { id: userId } },
      order: { number: "ASC" },
      relations: ["gameLevelPokemons", "gameLevelPokemons.pokemon"],
    });
  }

  async getGameLevelActiveByUser(userId: number) {
    const gameLevel = await this.gameLevelRepository.findOne({
      where: { user: { id: userId }, active: true },
    });
    if (gameLevel != null) {
      return true;
    }
    return false;
  }

  async getGameLevelByIdAndUserId(levelId: number, userId: number) {
    const gameLevel = await this.gameLevelRepository.findOne({
      where: {
        id: levelId,
        user: { id: userId },
        passed: false,
        blocked: false,
      },
      relations: [
        "gameLevelPokemons",
        "gameLevelPokemons.pokemon",
        "gameLevelPokemons.pokemon.pokemonTypes",
      ],
    });

    if (gameLevel && gameLevel.gameLevelPokemons) {
      gameLevel.gameLevelPokemons.sort((a, b) => a.order - b.order);
    }

    return gameLevel;
  }

  async activateGameLevel(gameLevel: GameLevel) {
    if (!gameLevel.active) {
      gameLevel.active = true;
      await this.gameLevelRepository.save(gameLevel);
    }
  }

  async updateGameLevelStatus(req: Request, res: Response) {
    try {
      const {
        gameLevelId,
        currentPokemonId,
        movementUsedTypeId,
        enemyPokemonId,
        pokemonChangedId,
        pokemonChangeDefeatId,
        surrender,
        league,
      }: UpdatePlayData = req.body.data;

      const userId = parseInt(req.user.userId);
      let userTeam: Team | LeagueTeam;
      let gameLevel: GameLevel | LeagueLevel;
      const user = await userService.getSimpleUserById(userId);
      const sharingan = await userService.isAccessoryEquipped(
        user,
        AccessoriesEnum.SHARINGAN
      );
      const mew = await userService.isAccessoryEquipped(
        user,
        AccessoriesEnum.MEW
      );

      if (league) {
        gameLevel = await leagueLevelService.getLeagueLevelByUser(
          userId,
          gameLevelId
        );
        userTeam = await leagueService.getLeagueTeamByUser(userId);
      } else {
        gameLevel = await this.getGameLevelByIdAndUserId(gameLevelId, userId);
        userTeam = await teamService.getUserTeam(userId);
      }

      if (!gameLevel) {
        res.status(404).json({
          message: "The level doesn't exist in the user",
        });
      }

      if (gameLevel.blocked) {
        res.status(404).json({
          message: "The level is blocked",
        });
        return;
      }
      if (!gameLevel.active) {
        gameLevel.active = true;
        if (league) {
          await this.leagueLevelRepository.save(gameLevel);
        } else {
          await this.gameLevelRepository.save(gameLevel);
        }
      }

      if (surrender) {
        if (league) {
          await leagueService.deleteLeagueTeam(userId);
          const existingLeagueLevels = await this.leagueLevelRepository.find({
            where: { user: { id: userId } },
          });
          await this.leagueLevelRepository.remove(existingLeagueLevels);
          const user = await userService.getSimpleUserById(userId);
          await leagueLevelService.createLeagueForUser(user);
          await this.leagueLevelRepository.save(gameLevel);
          res.status(200).json({
            message: "All league levels have been reset.",
          });
        } else {
          await teamService.resetLastUserTeam(userId);
          gameLevel.gameLevelPokemons.forEach((pokemon) => {
            pokemon.ps = pokemon.pokemon.ps + pokemon.ivPS * 2;
            this.gameLevelPokemonRepository.save(pokemon);
          });

          gameLevel.active = false;
          await this.gameLevelRepository.save(gameLevel);
          res.status(200).json({
            message: "All Pokémon have been restored due to surrender.",
          });
        }

        await userService.updateUserStatsByStatAndUserId("defeats", userId);
        return;
      }

      const enemyPokemon = gameLevel.gameLevelPokemons.find(
        (pokemon) => pokemon.id === enemyPokemonId
      );
      const currentPokemon = userTeam.trainerPokemons.find(
        (pokemon) => pokemon.id === currentPokemonId
      );

      if (!enemyPokemon || !currentPokemon) {
        res.status(404).json({ error: "Pokémon not found" });
        return;
      }

      let playerAttackResult: PlayerAttackResult = {};
      let enemyAttackResult: EnemyAttackResult = {};

      if (pokemonChangedId != 0) {
        currentPokemon.activeInGameLevel = false;
        currentPokemon.activeInLeagueLevel = false;
        const changedPokemon = userTeam.trainerPokemons.find(
          (pokemon) => pokemon.id === pokemonChangedId
        );
        changedPokemon.activeInGameLevel = true;
        changedPokemon.activeInLeagueLevel = true;

        if (enemyPokemon.ps > 0) {
          enemyAttackResult = await this.performEnemyAttack(
            enemyPokemon,
            changedPokemon,
            currentPokemon,
            league
          );
        }

        await this.trainerPokemonRepository.save(currentPokemon);
        await this.trainerPokemonRepository.save(changedPokemon);

        const responseData: UpdatedPlayData = {
          remainingMoves: changedPokemon.movements,
          damageCausedString: "",
          criticalCaused: false,
          damageCaused: 0,
          attackCaused: 0,
          enemyPokemonPs: enemyPokemon.ps,
          damageReceivedString:
            enemyAttackResult.damageMultiplier > 1
              ? "¡Es muy eficaz!"
              : enemyAttackResult.damageMultiplier < 1
              ? "No es muy eficaz..."
              : "Es algo eficaz",
          criticalReceived: enemyAttackResult.criticalReceived,
          damageReceived: enemyAttackResult.damageReceived,
          attackReceived: enemyAttackResult.attackReceived,
          currentPokemonPs: changedPokemon.ps,
          firstAttacker: "enemy",
        };

        res.status(200).json({ responseData });
        return;
      }

      if (pokemonChangeDefeatId != 0) {
        currentPokemon.activeInGameLevel = false;
        currentPokemon.activeInLeagueLevel = false;
        const changedPokemon = userTeam.trainerPokemons.find(
          (pokemon) => pokemon.id === pokemonChangeDefeatId
        );
        changedPokemon.activeInGameLevel = true;
        changedPokemon.activeInLeagueLevel = true;
        await this.trainerPokemonRepository.save(currentPokemon);
        await this.trainerPokemonRepository.save(changedPokemon);

        const responseData: UpdatedPlayData = {
          remainingMoves: currentPokemon.movements,
          damageCausedString: "",
          criticalCaused: false,
          damageCaused: 0,
          attackCaused: 0,
          enemyPokemonPs: 0,
          damageReceivedString: "",
          criticalReceived: false,
          damageReceived: 0,
          attackReceived: 0,
          currentPokemonPs: 0,
          firstAttacker: "",
        };

        res.status(200).json({ responseData });
        return;
      }

      currentPokemon.activeInGameLevel = true;
      currentPokemon.activeInLeagueLevel = true;

      let firstAttacker = "team";
      if (currentPokemon.pokemon.power < enemyPokemon.pokemon.power) {
        firstAttacker = "enemy";
      } else if (
        currentPokemon.pokemon.power === enemyPokemon.pokemon.power &&
        mew
      ) {
        firstAttacker = Math.random() < 0.5 ? "team" : "enemy";
        if (firstAttacker == "enemy") {
          firstAttacker = Math.random() < 0.5 ? "team" : "enemy";
        }
      } else if (
        currentPokemon.pokemon.power === enemyPokemon.pokemon.power &&
        !mew
      ) {
        firstAttacker = Math.random() < 0.5 ? "team" : "enemy";
      }

      const movementUsed = currentPokemon.movements.find(
        (m) => m.pokemonType.id === movementUsedTypeId
      );

      if (!league && (!movementUsed || movementUsed.quantity <= 0)) {
        res.status(404).json({ message: "Insuficient movements!" });
        return;
      }

      if (firstAttacker === "enemy") {
        enemyAttackResult = await this.performEnemyAttack(
          enemyPokemon,
          currentPokemon,
          currentPokemon,
          league
        );
        if (currentPokemon.ps > 0) {
          playerAttackResult = await this.performPlayerAttack(
            currentPokemon,
            enemyPokemon,
            movementUsedTypeId,
            league,
            sharingan
          );
        }
      } else {
        playerAttackResult = await this.performPlayerAttack(
          currentPokemon,
          enemyPokemon,
          movementUsedTypeId,
          league,
          sharingan
        );
        if (enemyPokemon.ps > 0) {
          enemyAttackResult = await this.performEnemyAttack(
            enemyPokemon,
            currentPokemon,
            currentPokemon,
            league
          );
        }
      }

      const responseData: UpdatedPlayData = {
        remainingMoves: currentPokemon.movements,
        damageCausedString:
          playerAttackResult.damageMultiplier > 1
            ? "¡Es muy eficaz!"
            : playerAttackResult.damageMultiplier < 1
            ? "No es muy eficaz..."
            : "Es algo eficaz",
        criticalCaused: playerAttackResult.criticalCaused,
        damageCaused: playerAttackResult.damageCaused,
        attackCaused: movementUsedTypeId,
        enemyPokemonPs: enemyPokemon.ps,
        damageReceivedString:
          enemyAttackResult.damageMultiplier > 1
            ? "¡Es muy eficaz!"
            : enemyAttackResult.damageMultiplier < 1
            ? "No es muy eficaz..."
            : "Es algo eficaz",
        criticalReceived: enemyAttackResult.criticalReceived,
        damageReceived: enemyAttackResult.damageReceived,
        attackReceived: enemyAttackResult.attackReceived,
        currentPokemonPs: currentPokemon.ps,
        firstAttacker: firstAttacker,
      };

      //await this.updatePlayerIVs(currentPokemon, enemyPokemon);

      console.log(responseData);

      res.status(200).json({ responseData });
    } catch (error) {
      console.error("Error handling request", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }

  async updatePlayerIVs(
    currentPokemon: TrainerPokemon,
    enemyPokemon: GameLevelPokemons
  ) {
    if (enemyPokemon.ps <= 0) {
      const enemyIVs = [
        { name: "ivPS", value: enemyPokemon.ivPS },
        { name: "ivAttack", value: enemyPokemon.ivAttack },
        { name: "ivDefense", value: enemyPokemon.ivDefense },
      ];

      enemyIVs.sort((a, b) => b.value - a.value);

      let selectedIVs: string[];

      if (
        enemyIVs[0].value === enemyIVs[1].value &&
        enemyIVs[1].value === enemyIVs[2].value
      ) {
        selectedIVs = enemyIVs
          .sort(() => Math.random() - 0.5)
          .slice(0, 2)
          .map((iv) => iv.name);
      } else {
        selectedIVs = [enemyIVs[0].name, enemyIVs[1].name];
      }

      selectedIVs.forEach((ivName) => {
        if (currentPokemon[ivName] < 31) {
          currentPokemon[ivName] += 1;
        }
      });

      await this.trainerPokemonRepository.save(currentPokemon);
    }
  }

  async performPlayerAttack(
    currentPokemon: TrainerPokemon,
    enemyPokemon: GameLevelPokemons,
    movementUsedTypeId: number,
    league: boolean,
    sharingan: boolean
  ) {
    console.log("ATACO YO");
    const movementUsed = currentPokemon.movements.find(
      (m) => m.pokemonType.id === movementUsedTypeId
    );

    movementUsed.quantity -= 1;
    if (!league) {
      await this.gameLevelRepository.manager.save(Movement, movementUsed);
    }

    let damageMultiplier = 1.0;
    const criticalCaused = await this.critChance(sharingan);

    for (const type of enemyPokemon.pokemon.pokemonTypes) {
      const multiplier = await typeInteractionService.getDamageMultiplier(
        movementUsed.pokemonType.id,
        type.id
      );

      damageMultiplier *= multiplier;
    }

    console.log("---daño yo contra enemigo--");
    console.log(damageMultiplier);

    const playerPower = league ? 10 : currentPokemon.pokemon.power;
    const enemyPower = league ? 10 : enemyPokemon.pokemon.power;

    const baseDamage = 50 + playerPower * 5;

    const playerPowerAdvantage = playerPower - enemyPower;
    let powerDifCalc: number;

    if (playerPowerAdvantage > 0) {
      powerDifCalc = 1 + playerPowerAdvantage * 0.06;
    } else {
      powerDifCalc = 1 + playerPowerAdvantage * 0.04;
    }

    const ivEffect =
      1 + (currentPokemon.ivAttack - enemyPokemon.ivDefense) / 70;

    console.log(
      "yo contra el enemigo " +
        playerPowerAdvantage +
        " " +
        powerDifCalc +
        " " +
        ivEffect
    );

    let damageCaused = Math.round(
      baseDamage * ivEffect * damageMultiplier * powerDifCalc
    );

    damageCaused = Math.round(damageCaused);
    if (criticalCaused) damageCaused *= 3;

    enemyPokemon.ps -= damageCaused;
    if (enemyPokemon.ps <= 0) {
      enemyPokemon.ps = 0;
      enemyPokemon.dead = true;
    }

    await this.gameLevelPokemonRepository.save(enemyPokemon);

    return { damageCaused, damageMultiplier, criticalCaused };
  }

  async performEnemyAttack(
    enemyPokemon: GameLevelPokemons,
    currentPokemon: TrainerPokemon,
    retiredPokemon: TrainerPokemon,
    league: boolean
  ) {
    console.log("ATACO CON EL ENEMIGO");
    let attackReceived: number;

    if (league) {
      const effectivenessMap: { typeId: number; effectiveness: number }[] = [];

      for (const enemyType of enemyPokemon.pokemon.pokemonTypes) {
        let totalEffectiveness = 1.0;

        for (const retiredType of retiredPokemon.pokemon.pokemonTypes) {
          const multiplier = await typeInteractionService.getDamageMultiplier(
            enemyType.id,
            retiredType.id
          );
          totalEffectiveness *= multiplier;
        }

        effectivenessMap.push({
          typeId: enemyType.id,
          effectiveness: totalEffectiveness,
        });
      }

      const maxEffectiveness = Math.max(
        ...effectivenessMap.map((e) => e.effectiveness)
      );

      const bestTypes = effectivenessMap.filter(
        (e) => e.effectiveness === maxEffectiveness
      );

      const chosenType =
        bestTypes[Math.floor(Math.random() * bestTypes.length)];

      attackReceived = chosenType.typeId;
    } else {
      attackReceived =
        enemyPokemon.pokemon.pokemonTypes[
          Math.floor(Math.random() * enemyPokemon.pokemon.pokemonTypes.length)
        ].id;
    }

    let damageMultiplier = 1.0;
    const criticalReceived = await this.critChance(false);

    for (const type of currentPokemon.pokemon.pokemonTypes) {
      const multiplier = await typeInteractionService.getDamageMultiplier(
        attackReceived,
        type.id
      );

      damageMultiplier *= multiplier;
    }

    console.log("---daño enemigo contra mi--");
    console.log(damageMultiplier);

    const playerPower = league ? 10 : currentPokemon.pokemon.power;
    const enemyPower = league ? 10 : enemyPokemon.pokemon.power;

    const baseDamage = 50 + enemyPower * 5;

    const powerDifferenceEffect = enemyPower - playerPower;
    let powerDifCalc: number;

    if (powerDifferenceEffect > 0) {
      powerDifCalc = 1 + powerDifferenceEffect * 0.06;
    } else {
      powerDifCalc = 1 + powerDifferenceEffect * 0.04;
    }

    const ivEffect =
      1 + (enemyPokemon.ivAttack - currentPokemon.ivDefense) / 70;
    console.log(
      "el enemigo contra mi " +
        powerDifferenceEffect +
        " " +
        powerDifCalc +
        " " +
        ivEffect
    );
    let damageReceived = Math.round(
      baseDamage * ivEffect * damageMultiplier * powerDifCalc
    );

    if (criticalReceived) damageReceived *= 3;
    currentPokemon.ps -= damageReceived;
    if (currentPokemon.ps < 0) currentPokemon.ps = 0;

    console.log("damage recieved del enemigo a mi");
    console.log(damageReceived);

    if (currentPokemon.ps <= 0) {
      console.log(
        `${currentPokemon.nickname} ha sido derrotado, aplicando penalización de movimientos`
      );
      await this.penalizeDefeatedPokemon(currentPokemon, league);
    }

    await this.trainerPokemonRepository.save(currentPokemon);

    return {
      damageReceived,
      damageMultiplier,
      attackReceived,
      criticalReceived,
    };
  }

  async critChance(sharingan: boolean) {
    if (sharingan) {
      return Math.random() < 0.15;
    }
    return Math.random() < 0.1;
  }

  async penalizeDefeatedPokemon(pokemon: TrainerPokemon, league: boolean) {
    if (pokemon.ps <= 0 && !league) {
      console.log(`Penalizando movimientos de ${pokemon.nickname} por derrota`);

      let totalPenalized = 0;
      for (const movement of pokemon.movements) {
        if (movement.quantity > 0) {
          const originalQuantity = movement.quantity;

          if (pokemon.movements.length === 1) {
            movement.quantity = Math.max(0, movement.quantity - 2);
          } else {
            movement.quantity = Math.max(0, movement.quantity - 1);
          }

          const penalized = originalQuantity - movement.quantity;
          totalPenalized += penalized;

          await this.gameLevelRepository.manager.save(Movement, movement);
        }
      }

      console.log(
        `Movimientos penalizados para ${pokemon.nickname}: ${totalPenalized} movimientos perdidos`
      );
    }
  }

  async unlockNextGameLevel(req: Request, res: Response) {
    try {
      const userId = parseInt(req.user.userId);
      const userGameLevels = await this.getGameLevelsByUser(userId);

      const currentGameLevel = userGameLevels.find(
        (gameLevel) => gameLevel.active
      );

      if (!currentGameLevel) {
        res.status(404).json({
          message: "No active game level found",
        });
        return;
      }

      const gameLevelPokemons = currentGameLevel.gameLevelPokemons;
      const pokemonAlive = gameLevelPokemons.some((pokemon) => pokemon.ps > 0);

      if (pokemonAlive) {
        res.status(404).json({
          message: "You must defeat all the Pokémon to unlock the next level",
        });
        return;
      }

      await userService.updateUserStatsByStatAndUserId("victories", userId);
      await teamService.resetLastUserTeam(userId);
      currentGameLevel.active = false;
      await this.gameLevelRepository.save(currentGameLevel);

      const nextGameLevel = userGameLevels.find(
        (gameLevel) => gameLevel.number === currentGameLevel.number + 1
      );

      if (!nextGameLevel) {
        res.status(200).json(null);
        return;
      }

      nextGameLevel.blocked = false;
      await this.gameLevelRepository.save(nextGameLevel);

      res.status(200).json({
        nextGameLevel,
      });
    } catch (error) {
      console.error("Error handling request", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }

  async claimGameLevelReward(req: Request, res: Response) {
    try {
      const userId = parseInt(req.user.userId);
      const gameLevelId = parseInt(req.query.gameLevelId);
      const user = await userService.getSimpleUserById(userId);
      const userGameLevels = await this.getGameLevelsByUser(userId);

      const currentGameLevel = userGameLevels.find(
        (gameLevel) => gameLevel.id == gameLevelId
      );

      if (!currentGameLevel) {
        res.status(404).json({
          message: "No active game level found",
        });
        return;
      }

      if (currentGameLevel.passed) {
        res.status(404).json({
          message: "You have already claimed the reward",
        });
        return;
      }

      if (currentGameLevel.unlocksAccessoryId) {
        let unlockedAccessories: Accessories;

        try {
          unlockedAccessories = JSON.parse(user.accessories) || {};

          const accessoryTypes = [
            "handAccessories",
            "headAccessories",
            "feetAccessories",
            "mouthAccessories",
            "eyesAccessories",
          ];

          accessoryTypes.forEach((type) => {
            const accessoryArray = unlockedAccessories[
              type as keyof Accessories
            ] as Accessory[];
            accessoryArray.forEach((accessory) => {
              if (accessory.id === currentGameLevel.unlocksAccessoryId) {
                accessory.unlocked = 1;
              }
            });
          });

          user.accessories = JSON.stringify(unlockedAccessories);
        } catch (e) {
          console.error("Error parsing accessories JSON", e);
        }
      }

      if (currentGameLevel.badgeWonId) {
        try {
          let badgesUnlockedArray = user.badgesUnlocked
            .split(",")
            .map((badge) => {
              const [id, unlocked] = badge.split(":");
              return { id: parseInt(id), unlocked: parseInt(unlocked) };
            });

          badgesUnlockedArray = badgesUnlockedArray.map((badge) => {
            if (badge.id === currentGameLevel.badgeWonId) {
              badge.unlocked = 1;
            }
            return badge;
          });

          user.badgesUnlocked = badgesUnlockedArray
            .map((badge) => `${badge.id}:${badge.unlocked}`)
            .join(",");
        } catch (e) {
          console.error("Error parsing badgesUnlocked JSON", e);
        }
      }

      currentGameLevel.passed = true;
      user.balance += currentGameLevel.reward;
      await this.gameLevelRepository.save(currentGameLevel);
      await this.userRepository.save(user);

      res.status(200).json({
        message: "Reward claimed",
        newBalance: user.balance,
        badgesUnlocked: user.badgesUnlocked,
        gameLevel: currentGameLevel,
      });
    } catch (error) {
      console.error("Error handling request", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }

  async claimLeagueLevelReward(req: Request, res: Response) {
    try {
      const userId = parseInt(req.user.userId);
      const leagueLevelId = parseInt(req.query.gameLevelId);
      const user = await userService.getSimpleUserById(userId);
      const userLeagueLevels = await leagueLevelService.getLeagueLevelsByUser(
        userId
      );

      console.log("LLEGO AQUI");

      const currentLeagueLevel = userLeagueLevels.find(
        (leagueLevel) => leagueLevel.id == leagueLevelId
      );

      if (!currentLeagueLevel) {
        res.status(404).json({
          message: "No active game level found",
        });
        return;
      }

      if (currentLeagueLevel.passed) {
        res.status(404).json({
          message: "You have already claimed the reward",
        });
        return;
      }

      if (currentLeagueLevel.badgeWonId) {
        try {
          let badgesUnlockedArray = user.badgesUnlocked
            .split(",")
            .map((badge) => {
              const [id, unlocked] = badge.split(":");
              return { id: parseInt(id), unlocked: parseInt(unlocked) };
            });

          badgesUnlockedArray = badgesUnlockedArray.map((badge) => {
            if (badge.id === currentLeagueLevel.badgeWonId) {
              badge.unlocked = 1;
            }
            return badge;
          });

          user.badgesUnlocked = badgesUnlockedArray
            .map((badge) => `${badge.id}:${badge.unlocked}`)
            .join(",");
        } catch (e) {
          console.error("Error parsing badgesUnlocked JSON", e);
        }
      }

      currentLeagueLevel.passed = true;
      user.balance += currentLeagueLevel.reward;
      await this.leagueLevelRepository.save(currentLeagueLevel);
      await this.userRepository.save(user);

      res.status(200).json({
        message: "Reward claimed",
        newBalance: user.balance,
        badgesUnlocked: user.badgesUnlocked,
        gameLevel: currentLeagueLevel,
      });
    } catch (error) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  }

  //Level generation
  async createLevels(user: User) {
    this.pokemonArrays[3] = await pokemonService.getAllByPower(3);
    this.pokemonArrays[4] = await pokemonService.getAllByPower(4);
    this.pokemonArrays[5] = await pokemonService.getAllByPower(5);
    this.pokemonArrays[6] = await pokemonService.getAllByPower(6);
    this.pokemonArrays[8] = await pokemonService.getAllByPower(8);
    this.pokemonArrays[10] = await pokemonService.getAllByPower(10);

    let levelOrder = 0;
    for (let i = 2; i <= 32; i++) {
      levelOrder = i - 1;
      const blocked = i === 2 ? false : true;
      switch (levelOrder) {
        case 2:
          await this.createLevel(
            user,
            levelOrder,
            blocked,
            AccessoriesEnum.ELEGANT,
            null
          );
          break;
        case 4:
          await this.createLevel(
            user,
            levelOrder,
            blocked,
            AccessoriesEnum.ACE_OF_HEARTS,
            null
          );
          break;
        case 6:
          await this.createLevel(
            user,
            levelOrder,
            blocked,
            AccessoriesEnum.PARTY,
            null
          );
          break;
        case 7:
          await this.createLevel(
            user,
            levelOrder,
            blocked,
            null,
            BadgesEnum.SILVER
          );
          break;
        case 8:
          await this.createLevel(
            user,
            levelOrder,
            blocked,
            AccessoriesEnum.CHRISTMAS,
            null
          );
          break;
        case 10:
          await this.createLevel(
            user,
            levelOrder,
            blocked,
            AccessoriesEnum.RED_VANS,
            null
          );
          break;
        case 12:
          await this.createLevel(
            user,
            levelOrder,
            blocked,
            AccessoriesEnum.HOT,
            null
          );
          break;
        case 13:
          await this.createLevel(
            user,
            levelOrder,
            blocked,
            null,
            BadgesEnum.GOLD
          );
          break;
        case 14:
          await this.createLevel(
            user,
            levelOrder,
            blocked,
            AccessoriesEnum.BOXING_GLOVES,
            null
          );
          break;
        case 16:
          await this.createLevel(
            user,
            levelOrder,
            blocked,
            AccessoriesEnum.SKULL,
            null
          );
          break;
        case 18:
          await this.createLevel(
            user,
            levelOrder,
            blocked,
            AccessoriesEnum.DIAMOND,
            null
          );
          break;
        case 19:
          await this.createLevel(
            user,
            levelOrder,
            blocked,
            null,
            BadgesEnum.PEARL
          );
          break;
        case 20:
          await this.createLevel(
            user,
            levelOrder,
            blocked,
            AccessoriesEnum.CIGARETTE,
            null
          );
          break;
        case 22:
          await this.createLevel(
            user,
            levelOrder,
            blocked,
            AccessoriesEnum.BLUE_VANS,
            null
          );
          break;
        case 24:
          await this.createLevel(
            user,
            levelOrder,
            blocked,
            AccessoriesEnum.CHARIZARD_BALLOON,
            null
          );
          break;
        case 25:
          await this.createLevel(
            user,
            levelOrder,
            blocked,
            null,
            BadgesEnum.RUBY
          );
          break;
        case 26:
          await this.createLevel(
            user,
            levelOrder,
            blocked,
            AccessoriesEnum.MEW,
            null
          );
          break;
        case 28:
          await this.createLevel(
            user,
            levelOrder,
            blocked,
            AccessoriesEnum.MASTER_BALL,
            null
          );
          break;
        case 30:
          await this.createLevel(
            user,
            levelOrder,
            blocked,
            AccessoriesEnum.SHARINGAN,
            null
          );
          break;
        case 31:
          await this.createLevel(
            user,
            levelOrder,
            blocked,
            null,
            BadgesEnum.SAPPHIRE
          );
          break;
        default:
          await this.createLevel(user, levelOrder, blocked, null, null);
      }
    }
  }

  createGameLevelPokemon = (
    gameLevel: GameLevel,
    pokemon: Pokemon,
    order: number
  ): GameLevelPokemons => {
    const gameLevelPokemon = new GameLevelPokemons();
    gameLevelPokemon.gameLevel = gameLevel;
    gameLevelPokemon.pokemon = pokemon;
    gameLevelPokemon.order = order;

    const minTotalIV = Math.floor(10 + (gameLevel.number / 30) * 60);
    const maxTotalIV = Math.floor(20 + (gameLevel.number / 30) * 73);

    const totalIV =
      Math.floor(Math.random() * (maxTotalIV - minTotalIV + 1)) + minTotalIV;

    const distributeIVs = (total: number) => {
      let ivPS = 0;
      let ivAttack = 0;
      let ivDefense = 0;

      for (let i = 0; i < total; i++) {
        const stat = Math.floor(Math.random() * 3);
        if (stat === 0 && ivPS < 31) {
          ivPS++;
        } else if (stat === 1 && ivAttack < 31) {
          ivAttack++;
        } else if (stat === 2 && ivDefense < 31) {
          ivDefense++;
        }
      }

      return { ivPS, ivAttack, ivDefense };
    };

    const { ivPS, ivAttack, ivDefense } = distributeIVs(totalIV);

    gameLevelPokemon.ivPS = ivPS;
    gameLevelPokemon.ps = pokemon.ps + gameLevelPokemon.ivPS * 2;
    gameLevelPokemon.ivAttack = ivAttack;
    gameLevelPokemon.ivDefense = ivDefense;

    return gameLevelPokemon;
  };

  getRandomPokemon = (
    pokemonArray: Pokemon[],
    existingPokemons: Pokemon[]
  ): Pokemon => {
    let randomPokemon: Pokemon | null = null;

    // Genera un Pokémon aleatorio
    while (!randomPokemon) {
      const randomIndex = Math.floor(Math.random() * pokemonArray.length);
      const selectedPokemon = pokemonArray[randomIndex];

      // Verifica si el Pokémon seleccionado ya existe en el nivel
      const isExistingPokemon = existingPokemons.some(
        (pokemon) => pokemon.id === selectedPokemon.id
      );

      // Si el Pokémon no existe en el nivel, asigna el Pokémon aleatorio seleccionado
      if (!isExistingPokemon) {
        randomPokemon = selectedPokemon;
      }
    }

    return randomPokemon;
  };

  async createLevel(
    user: User,
    levelNumber: number,
    blocked: boolean,
    unlocksAccessoryId: string | null,
    badgeWonId: number | null
  ) {
    const level = new GameLevel();
    level.user = user;
    level.passed = false;
    level.blocked = blocked;
    level.active = false;
    level.number = levelNumber;
    level.reward = 25 * (levelNumber - 1) + 50;
    level.unlocksAccessoryId = unlocksAccessoryId;
    level.badgeWonId = badgeWonId;

    const savedLevel = await this.gameLevelRepository.save(level);

    const gameLevelPokemons: GameLevelPokemons[] = [];
    const existingPokemons: Pokemon[] = [];

    switch (levelNumber) {
      case 1:
        for (let i = 0; i < 6; i++) {
          const pokemon = this.getRandomPokemon(
            this.pokemonArrays[3],
            existingPokemons
          );
          gameLevelPokemons.push(
            this.createGameLevelPokemon(savedLevel, pokemon, i + 1)
          );
          existingPokemons.push(pokemon);
        }
        break;
      case 2:
        for (let i = 0; i < 5; i++) {
          const pokemon = this.getRandomPokemon(
            this.pokemonArrays[3],
            existingPokemons
          );
          gameLevelPokemons.push(
            this.createGameLevelPokemon(savedLevel, pokemon, i + 1)
          );
          existingPokemons.push(pokemon);
        }
        const pokemon4_1 = this.getRandomPokemon(
          this.pokemonArrays[4],
          existingPokemons
        );
        gameLevelPokemons.push(
          this.createGameLevelPokemon(savedLevel, pokemon4_1, 6)
        );
        break;
      case 3:
        for (let i = 0; i < 4; i++) {
          const pokemon = this.getRandomPokemon(
            this.pokemonArrays[3],
            existingPokemons
          );
          gameLevelPokemons.push(
            this.createGameLevelPokemon(savedLevel, pokemon, i + 1)
          );
          existingPokemons.push(pokemon);
        }
        for (let i = 0; i < 2; i++) {
          const pokemon = this.getRandomPokemon(
            this.pokemonArrays[4],
            existingPokemons
          );
          gameLevelPokemons.push(
            this.createGameLevelPokemon(savedLevel, pokemon, i + 5)
          );
          existingPokemons.push(pokemon);
        }
        break;
      case 4:
        for (let i = 0; i < 3; i++) {
          const pokemon = this.getRandomPokemon(
            this.pokemonArrays[3],
            existingPokemons
          );
          gameLevelPokemons.push(
            this.createGameLevelPokemon(savedLevel, pokemon, i + 1)
          );
          existingPokemons.push(pokemon);
        }
        for (let i = 0; i < 3; i++) {
          const pokemon = this.getRandomPokemon(
            this.pokemonArrays[4],
            existingPokemons
          );
          gameLevelPokemons.push(
            this.createGameLevelPokemon(savedLevel, pokemon, i + 4)
          );
          existingPokemons.push(pokemon);
        }
        break;
      case 5:
        for (let i = 0; i < 2; i++) {
          const pokemon = this.getRandomPokemon(
            this.pokemonArrays[3],
            existingPokemons
          );
          gameLevelPokemons.push(
            this.createGameLevelPokemon(savedLevel, pokemon, i + 1)
          );
          existingPokemons.push(pokemon);
        }
        for (let i = 0; i < 4; i++) {
          const pokemon = this.getRandomPokemon(
            this.pokemonArrays[4],
            existingPokemons
          );
          gameLevelPokemons.push(
            this.createGameLevelPokemon(savedLevel, pokemon, i + 3)
          );
          existingPokemons.push(pokemon);
        }
        break;
      case 6:
        const pokemon3_6 = this.getRandomPokemon(
          this.pokemonArrays[3],
          existingPokemons
        );
        gameLevelPokemons.push(
          this.createGameLevelPokemon(savedLevel, pokemon3_6, 1)
        );
        existingPokemons.push(pokemon3_6);
        for (let i = 0; i < 5; i++) {
          const pokemon = this.getRandomPokemon(
            this.pokemonArrays[4],
            existingPokemons
          );
          gameLevelPokemons.push(
            this.createGameLevelPokemon(savedLevel, pokemon, i + 2)
          );
          existingPokemons.push(pokemon);
        }
        break;
      case 7:
        for (let i = 0; i < 6; i++) {
          const pokemon = this.getRandomPokemon(
            this.pokemonArrays[4],
            existingPokemons
          );
          gameLevelPokemons.push(
            this.createGameLevelPokemon(savedLevel, pokemon, i + 1)
          );
          existingPokemons.push(pokemon);
        }
        break;
      case 8:
        for (let i = 0; i < 5; i++) {
          const pokemon = this.getRandomPokemon(
            this.pokemonArrays[4],
            existingPokemons
          );
          gameLevelPokemons.push(
            this.createGameLevelPokemon(savedLevel, pokemon, i + 1)
          );
          existingPokemons.push(pokemon);
        }
        const pokemon5_8 = this.getRandomPokemon(
          this.pokemonArrays[5],
          existingPokemons
        );
        gameLevelPokemons.push(
          this.createGameLevelPokemon(savedLevel, pokemon5_8, 6)
        );
        break;
      case 9:
        for (let i = 0; i < 4; i++) {
          const pokemon = this.getRandomPokemon(
            this.pokemonArrays[4],
            existingPokemons
          );
          gameLevelPokemons.push(
            this.createGameLevelPokemon(savedLevel, pokemon, i + 1)
          );
          existingPokemons.push(pokemon);
        }
        for (let i = 0; i < 2; i++) {
          const pokemon = this.getRandomPokemon(
            this.pokemonArrays[5],
            existingPokemons
          );
          gameLevelPokemons.push(
            this.createGameLevelPokemon(savedLevel, pokemon, i + 5)
          );
          existingPokemons.push(pokemon);
        }
        break;
      case 10:
        for (let i = 0; i < 3; i++) {
          const pokemon = this.getRandomPokemon(
            this.pokemonArrays[4],
            existingPokemons
          );
          gameLevelPokemons.push(
            this.createGameLevelPokemon(savedLevel, pokemon, i + 1)
          );
          existingPokemons.push(pokemon);
        }
        for (let i = 0; i < 3; i++) {
          const pokemon = this.getRandomPokemon(
            this.pokemonArrays[5],
            existingPokemons
          );
          gameLevelPokemons.push(
            this.createGameLevelPokemon(savedLevel, pokemon, i + 4)
          );
          existingPokemons.push(pokemon);
        }
        break;
      case 11:
        for (let i = 0; i < 2; i++) {
          const pokemon = this.getRandomPokemon(
            this.pokemonArrays[4],
            existingPokemons
          );
          gameLevelPokemons.push(
            this.createGameLevelPokemon(savedLevel, pokemon, i + 1)
          );
          existingPokemons.push(pokemon);
        }
        for (let i = 0; i < 4; i++) {
          const pokemon = this.getRandomPokemon(
            this.pokemonArrays[5],
            existingPokemons
          );
          gameLevelPokemons.push(
            this.createGameLevelPokemon(savedLevel, pokemon, i + 3)
          );
          existingPokemons.push(pokemon);
        }
        break;
      case 12:
        const pokemon5_12 = this.getRandomPokemon(
          this.pokemonArrays[4],
          existingPokemons
        );
        gameLevelPokemons.push(
          this.createGameLevelPokemon(savedLevel, pokemon5_12, 1)
        );
        existingPokemons.push(pokemon5_12);
        for (let i = 0; i < 5; i++) {
          const pokemon = this.getRandomPokemon(
            this.pokemonArrays[5],
            existingPokemons
          );
          gameLevelPokemons.push(
            this.createGameLevelPokemon(savedLevel, pokemon, i + 2)
          );
          existingPokemons.push(pokemon);
        }
        break;
      case 13:
        for (let i = 0; i < 6; i++) {
          const pokemon = this.getRandomPokemon(
            this.pokemonArrays[5],
            existingPokemons
          );
          gameLevelPokemons.push(
            this.createGameLevelPokemon(savedLevel, pokemon, i + 1)
          );
          existingPokemons.push(pokemon);
        }
        break;
      case 14:
        for (let i = 0; i < 5; i++) {
          const pokemon = this.getRandomPokemon(
            this.pokemonArrays[5],
            existingPokemons
          );
          gameLevelPokemons.push(
            this.createGameLevelPokemon(savedLevel, pokemon, i + 1)
          );
          existingPokemons.push(pokemon);
        }
        const pokemon6_14 = this.getRandomPokemon(
          this.pokemonArrays[6],
          existingPokemons
        );
        gameLevelPokemons.push(
          this.createGameLevelPokemon(savedLevel, pokemon6_14, 6)
        );
        break;
      case 15:
        for (let i = 0; i < 4; i++) {
          const pokemon = this.getRandomPokemon(
            this.pokemonArrays[5],
            existingPokemons
          );
          gameLevelPokemons.push(
            this.createGameLevelPokemon(savedLevel, pokemon, i + 1)
          );
          existingPokemons.push(pokemon);
        }
        for (let i = 0; i < 2; i++) {
          const pokemon = this.getRandomPokemon(
            this.pokemonArrays[6],
            existingPokemons
          );
          gameLevelPokemons.push(
            this.createGameLevelPokemon(savedLevel, pokemon, i + 5)
          );
          existingPokemons.push(pokemon);
        }
        break;
      case 16:
        for (let i = 0; i < 3; i++) {
          const pokemon = this.getRandomPokemon(
            this.pokemonArrays[5],
            existingPokemons
          );
          gameLevelPokemons.push(
            this.createGameLevelPokemon(savedLevel, pokemon, i + 1)
          );
          existingPokemons.push(pokemon);
        }
        for (let i = 0; i < 3; i++) {
          const pokemon = this.getRandomPokemon(
            this.pokemonArrays[6],
            existingPokemons
          );
          gameLevelPokemons.push(
            this.createGameLevelPokemon(savedLevel, pokemon, i + 4)
          );
          existingPokemons.push(pokemon);
        }
        break;
      case 17:
        for (let i = 0; i < 2; i++) {
          const pokemon = this.getRandomPokemon(
            this.pokemonArrays[5],
            existingPokemons
          );
          gameLevelPokemons.push(
            this.createGameLevelPokemon(savedLevel, pokemon, i + 1)
          );
          existingPokemons.push(pokemon);
        }
        for (let i = 0; i < 4; i++) {
          const pokemon = this.getRandomPokemon(
            this.pokemonArrays[6],
            existingPokemons
          );
          gameLevelPokemons.push(
            this.createGameLevelPokemon(savedLevel, pokemon, i + 3)
          );
          existingPokemons.push(pokemon);
        }
        break;
      case 18:
        const pokemon6_18 = this.getRandomPokemon(
          this.pokemonArrays[5],
          existingPokemons
        );
        gameLevelPokemons.push(
          this.createGameLevelPokemon(savedLevel, pokemon6_18, 1)
        );
        existingPokemons.push(pokemon6_18);
        for (let i = 0; i < 5; i++) {
          const pokemon = this.getRandomPokemon(
            this.pokemonArrays[6],
            existingPokemons
          );
          gameLevelPokemons.push(
            this.createGameLevelPokemon(savedLevel, pokemon, i + 2)
          );
          existingPokemons.push(pokemon);
        }
        break;
      case 19:
        for (let i = 0; i < 6; i++) {
          const pokemon = this.getRandomPokemon(
            this.pokemonArrays[6],
            existingPokemons
          );
          gameLevelPokemons.push(
            this.createGameLevelPokemon(savedLevel, pokemon, i + 1)
          );
          existingPokemons.push(pokemon);
        }
        break;
      case 20:
        for (let i = 0; i < 5; i++) {
          const pokemon = this.getRandomPokemon(
            this.pokemonArrays[6],
            existingPokemons
          );
          gameLevelPokemons.push(
            this.createGameLevelPokemon(savedLevel, pokemon, i + 1)
          );
          existingPokemons.push(pokemon);
        }
        const pokemon8_20 = this.getRandomPokemon(
          this.pokemonArrays[8],
          existingPokemons
        );
        gameLevelPokemons.push(
          this.createGameLevelPokemon(savedLevel, pokemon8_20, 6)
        );
        break;
      case 21:
        for (let i = 0; i < 4; i++) {
          const pokemon = this.getRandomPokemon(
            this.pokemonArrays[6],
            existingPokemons
          );
          gameLevelPokemons.push(
            this.createGameLevelPokemon(savedLevel, pokemon, i + 1)
          );
          existingPokemons.push(pokemon);
        }
        for (let i = 0; i < 2; i++) {
          const pokemon = this.getRandomPokemon(
            this.pokemonArrays[8],
            existingPokemons
          );
          gameLevelPokemons.push(
            this.createGameLevelPokemon(savedLevel, pokemon, i + 5)
          );
          existingPokemons.push(pokemon);
        }
        break;
      case 22:
        for (let i = 0; i < 3; i++) {
          const pokemon = this.getRandomPokemon(
            this.pokemonArrays[6],
            existingPokemons
          );
          gameLevelPokemons.push(
            this.createGameLevelPokemon(savedLevel, pokemon, i + 1)
          );
          existingPokemons.push(pokemon);
        }
        for (let i = 0; i < 3; i++) {
          const pokemon = this.getRandomPokemon(
            this.pokemonArrays[8],
            existingPokemons
          );
          gameLevelPokemons.push(
            this.createGameLevelPokemon(savedLevel, pokemon, i + 4)
          );
          existingPokemons.push(pokemon);
        }
        break;
      case 23:
        for (let i = 0; i < 2; i++) {
          const pokemon = this.getRandomPokemon(
            this.pokemonArrays[6],
            existingPokemons
          );
          gameLevelPokemons.push(
            this.createGameLevelPokemon(savedLevel, pokemon, i + 1)
          );
          existingPokemons.push(pokemon);
        }
        for (let i = 0; i < 4; i++) {
          const pokemon = this.getRandomPokemon(
            this.pokemonArrays[8],
            existingPokemons
          );
          gameLevelPokemons.push(
            this.createGameLevelPokemon(savedLevel, pokemon, i + 3)
          );
          existingPokemons.push(pokemon);
        }
        break;
      case 24:
        const pokemon8_24 = this.getRandomPokemon(
          this.pokemonArrays[6],
          existingPokemons
        );
        gameLevelPokemons.push(
          this.createGameLevelPokemon(savedLevel, pokemon8_24, 1)
        );
        existingPokemons.push(pokemon8_24);
        for (let i = 0; i < 5; i++) {
          const pokemon = this.getRandomPokemon(
            this.pokemonArrays[8],
            existingPokemons
          );
          gameLevelPokemons.push(
            this.createGameLevelPokemon(savedLevel, pokemon, i + 2)
          );
          existingPokemons.push(pokemon);
        }
        break;
      case 25:
        for (let i = 0; i < 6; i++) {
          const pokemon = this.getRandomPokemon(
            this.pokemonArrays[8],
            existingPokemons
          );
          gameLevelPokemons.push(
            this.createGameLevelPokemon(savedLevel, pokemon, i + 1)
          );
          existingPokemons.push(pokemon);
        }
        break;
      case 26:
        for (let i = 0; i < 5; i++) {
          const pokemon = this.getRandomPokemon(
            this.pokemonArrays[8],
            existingPokemons
          );
          gameLevelPokemons.push(
            this.createGameLevelPokemon(savedLevel, pokemon, i + 1)
          );
          existingPokemons.push(pokemon);
        }
        const pokemon10_26 = this.getRandomPokemon(
          this.pokemonArrays[10],
          existingPokemons
        );
        gameLevelPokemons.push(
          this.createGameLevelPokemon(savedLevel, pokemon10_26, 6)
        );
        break;
      case 27:
        for (let i = 0; i < 4; i++) {
          const pokemon = this.getRandomPokemon(
            this.pokemonArrays[8],
            existingPokemons
          );
          gameLevelPokemons.push(
            this.createGameLevelPokemon(savedLevel, pokemon, i + 1)
          );
          existingPokemons.push(pokemon);
        }
        for (let i = 0; i < 2; i++) {
          const pokemon = this.getRandomPokemon(
            this.pokemonArrays[10],
            existingPokemons
          );
          gameLevelPokemons.push(
            this.createGameLevelPokemon(savedLevel, pokemon, i + 5)
          );
          existingPokemons.push(pokemon);
        }
        break;
      case 28:
        for (let i = 0; i < 3; i++) {
          const pokemon = this.getRandomPokemon(
            this.pokemonArrays[8],
            existingPokemons
          );
          gameLevelPokemons.push(
            this.createGameLevelPokemon(savedLevel, pokemon, i + 1)
          );
          existingPokemons.push(pokemon);
        }
        for (let i = 0; i < 3; i++) {
          const pokemon = this.getRandomPokemon(
            this.pokemonArrays[10],
            existingPokemons
          );
          gameLevelPokemons.push(
            this.createGameLevelPokemon(savedLevel, pokemon, i + 4)
          );
          existingPokemons.push(pokemon);
        }
        break;
      case 29:
        for (let i = 0; i < 2; i++) {
          const pokemon = this.getRandomPokemon(
            this.pokemonArrays[8],
            existingPokemons
          );
          gameLevelPokemons.push(
            this.createGameLevelPokemon(savedLevel, pokemon, i + 1)
          );
          existingPokemons.push(pokemon);
        }
        for (let i = 0; i < 4; i++) {
          const pokemon = this.getRandomPokemon(
            this.pokemonArrays[10],
            existingPokemons
          );
          gameLevelPokemons.push(
            this.createGameLevelPokemon(savedLevel, pokemon, i + 3)
          );
          existingPokemons.push(pokemon);
        }
        break;
      case 30:
        const pokemon10_30 = this.getRandomPokemon(
          this.pokemonArrays[8],
          existingPokemons
        );
        gameLevelPokemons.push(
          this.createGameLevelPokemon(savedLevel, pokemon10_30, 1)
        );
        existingPokemons.push(pokemon10_30);
        for (let i = 0; i < 5; i++) {
          const pokemon = this.getRandomPokemon(
            this.pokemonArrays[10],
            existingPokemons
          );
          gameLevelPokemons.push(
            this.createGameLevelPokemon(savedLevel, pokemon, i + 2)
          );
          existingPokemons.push(pokemon);
        }
        break;
      case 31:
        for (let i = 0; i < 6; i++) {
          const pokemon = this.getRandomPokemon(
            this.pokemonArrays[10],
            existingPokemons
          );
          gameLevelPokemons.push(
            this.createGameLevelPokemon(savedLevel, pokemon, i + 1)
          );
          existingPokemons.push(pokemon);
        }
        break;
    }

    await this.gameLevelPokemonRepository.save(gameLevelPokemons);
  }
}

const gameLevelService = new GameLevelService();

export { gameLevelService };
