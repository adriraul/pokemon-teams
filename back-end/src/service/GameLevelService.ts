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
import { Team } from "../entity/Team";
import { teamService } from "./TeamService";

interface UpdatePlayData {
  gameLevelId: number;
  currentPokemonId: number;
  movementUsedTypeId?: number;
  enemyPokemonId: number;
  pokemonChangedId?: number;
  pokemonChangeDefeatId?: number;
  surrender: boolean;
}

interface UpdatedPlayData {
  remainingMoves: Movement[];
  damageCausedString: string;
  damageCaused: number;
  attackCaused: number;
  currentPokemonPs: number;
  damageReceivedString: string;
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
}

interface EnemyAttackResult extends AttackResult {
  damageReceived?: number;
  attackReceived?: number;
}

export class GameLevelService {
  private gameLevelRepository = AppDataSource.getRepository(GameLevel);
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
      gameLevel.gameLevelPokemons.sort((a, b) => b.order - a.order);
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
      }: UpdatePlayData = req.body.data;

      const userId = parseInt(req.user.userId);
      const user = await userService.getUserById(userId);
      const userTeam = user.teams[0];

      const gameLevel = await this.getGameLevelByIdAndUserId(
        gameLevelId,
        userId
      );

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
        await this.gameLevelRepository.save(gameLevel);
      }

      if (surrender) {
        await teamService.resetLastUserTeam(userId);

        gameLevel.gameLevelPokemons.forEach((pokemon) => {
          pokemon.ps = 30 * pokemon.pokemon.power;
          this.gameLevelPokemonRepository.save(pokemon);
        });

        gameLevel.active = false;
        await this.gameLevelRepository.save(gameLevel);

        res.status(200).json({
          message: "All Pokémon have been restored due to surrender.",
        });
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
        const changedPokemon = userTeam.trainerPokemons.find(
          (pokemon) => pokemon.id === pokemonChangedId
        );
        changedPokemon.activeInGameLevel = true;

        if (enemyPokemon.ps > 0) {
          enemyAttackResult = await this.performEnemyAttack(
            enemyPokemon,
            changedPokemon
          );
        }

        await this.trainerPokemonRepository.save(currentPokemon);
        await this.trainerPokemonRepository.save(changedPokemon);

        const responseData: UpdatedPlayData = {
          remainingMoves: changedPokemon.movements,
          damageCausedString: "",
          damageCaused: 0,
          attackCaused: 0,
          enemyPokemonPs: enemyPokemon.ps,
          damageReceivedString:
            enemyAttackResult.damageMultiplier > 1
              ? "¡Es muy eficaz!"
              : enemyAttackResult.damageMultiplier < 1
              ? "No es muy eficaz..."
              : "Es algo eficaz",
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
        const changedPokemon = userTeam.trainerPokemons.find(
          (pokemon) => pokemon.id === pokemonChangeDefeatId
        );
        changedPokemon.activeInGameLevel = true;
        await this.trainerPokemonRepository.save(currentPokemon);
        await this.trainerPokemonRepository.save(changedPokemon);

        const responseData: UpdatedPlayData = {
          remainingMoves: currentPokemon.movements,
          damageCausedString: "",
          damageCaused: 0,
          attackCaused: 0,
          enemyPokemonPs: 0,
          damageReceivedString: "",
          damageReceived: 0,
          attackReceived: 0,
          currentPokemonPs: 0,
          firstAttacker: "",
        };

        res.status(200).json({ responseData });
        return;
      }

      currentPokemon.activeInGameLevel = true;
      let firstAttacker = "team";
      if (currentPokemon.pokemon.power < enemyPokemon.pokemon.power) {
        firstAttacker = "enemy";
      } else if (currentPokemon.pokemon.power === enemyPokemon.pokemon.power) {
        firstAttacker = Math.random() < 0.5 ? "team" : "enemy";
      }

      const movementUsed = currentPokemon.movements.find(
        (m) => m.pokemonType.id === movementUsedTypeId
      );

      if (!movementUsed || movementUsed.quantity <= 0) {
        res.status(404).json({ message: "Insuficient movements!" });
        return;
      }

      if (firstAttacker === "enemy") {
        enemyAttackResult = await this.performEnemyAttack(
          enemyPokemon,
          currentPokemon
        );
        if (currentPokemon.ps <= 0) {
          res.status(200).json({ message: "Your Pokémon fainted!" });
          return;
        }
        playerAttackResult = await this.performPlayerAttack(
          currentPokemon,
          enemyPokemon,
          movementUsedTypeId
        );
      } else {
        playerAttackResult = await this.performPlayerAttack(
          currentPokemon,
          enemyPokemon,
          movementUsedTypeId
        );
        if (enemyPokemon.ps > 0) {
          enemyAttackResult = await this.performEnemyAttack(
            enemyPokemon,
            currentPokemon
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
        damageCaused: playerAttackResult.damageCaused,
        attackCaused: movementUsedTypeId,
        enemyPokemonPs: enemyPokemon.ps,
        damageReceivedString:
          enemyAttackResult.damageMultiplier > 1
            ? "¡Es muy eficaz!"
            : enemyAttackResult.damageMultiplier < 1
            ? "No es muy eficaz..."
            : "Es algo eficaz",
        damageReceived: enemyAttackResult.damageReceived,
        attackReceived: enemyAttackResult.attackReceived,
        currentPokemonPs: currentPokemon.ps,
        firstAttacker: firstAttacker,
      };

      console.log(responseData);

      res.status(200).json({ responseData });
    } catch (error) {
      console.error("Error handling request", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }

  async performPlayerAttack(currentPokemon, enemyPokemon, movementUsedTypeId) {
    console.log("ATACO YO");
    const movementUsed = currentPokemon.movements.find(
      (m) => m.pokemonType.id === movementUsedTypeId
    );

    movementUsed.quantity -= 1;
    await this.gameLevelRepository.manager.save(Movement, movementUsed);

    let damageMultiplier = 1.0;
    for (const type of enemyPokemon.pokemon.pokemonTypes) {
      const multiplier = await typeInteractionService.getDamageMultiplier(
        movementUsed.pokemonType.id,
        type.id
      );

      damageMultiplier *= multiplier;
      console.log("---daño yo contra enemigo--");
      console.log(damageMultiplier);
    }
    let damageCaused =
      (15 + currentPokemon.pokemon.power * 2) * damageMultiplier;
    damageCaused = Math.round(damageCaused);
    enemyPokemon.ps -= damageCaused;
    if (enemyPokemon.ps <= 0) {
      enemyPokemon.ps = 0;
      enemyPokemon.dead = true;
    }

    await this.gameLevelPokemonRepository.save(enemyPokemon);

    return { damageCaused, damageMultiplier };
  }

  async performEnemyAttack(enemyPokemon, currentPokemon) {
    console.log("ATACO CON EL ENEMIGO");
    const attackReceived =
      enemyPokemon.pokemon.pokemonTypes[
        Math.floor(Math.random() * enemyPokemon.pokemon.pokemonTypes.length)
      ].id;

    let damageMultiplier = 1.0;
    for (const type of currentPokemon.pokemon.pokemonTypes) {
      const multiplier = await typeInteractionService.getDamageMultiplier(
        attackReceived,
        type.id
      );

      damageMultiplier *= multiplier;
      console.log("---daño enemigo contra mi--");
      console.log(damageMultiplier);
    }
    let damageReceived =
      (15 + enemyPokemon.pokemon.power * 2) * damageMultiplier;
    damageReceived = Math.round(damageReceived);
    currentPokemon.ps -= damageReceived;
    if (currentPokemon.ps < 0) currentPokemon.ps = 0;

    console.log("damage recieved del enemigo a mi");
    console.log(damageReceived);
    await this.trainerPokemonRepository.save(currentPokemon);

    return { damageReceived, damageMultiplier, attackReceived };
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

      const nextGameLevel = userGameLevels.find(
        (gameLevel) => gameLevel.number === currentGameLevel.number + 1
      );

      if (!nextGameLevel) {
        res.status(404).json({
          message: "You have reached the last level",
        });
        return;
      }

      await teamService.resetLastUserTeam(userId);
      currentGameLevel.active = false;
      nextGameLevel.active = true;
      nextGameLevel.blocked = false;
      await this.gameLevelRepository.save(currentGameLevel);
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
      const user = await userService.getUserById(userId);
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

      currentGameLevel.passed = true;
      user.balance += currentGameLevel.reward;
      await this.gameLevelRepository.save(currentGameLevel);
      await this.userRepository.save(user);

      res.status(200).json({
        message: "Reward claimed",
        newBalance: user.balance,
        gameLevel: currentGameLevel,
      });
    } catch (error) {
      console.error("Error handling request", error);
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

    let levelOrder = 1;
    for (let i = 1; i <= 18; i++) {
      const blocked = i === 1 ? false : true;
      await this.createLevel(user, i, blocked, levelOrder);
      levelOrder++;
      await this.createLevel(user, i, true, levelOrder);
      levelOrder++;
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
    gameLevelPokemon.ps = pokemon.ps;
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
    levelOrder: number
  ) {
    const level = new GameLevel();
    level.user = user;
    level.passed = false;
    level.blocked = blocked;
    level.active = false;
    level.number = levelOrder;
    level.reward = 25 * (levelNumber - 1) + 50;

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
        const pokemon4 = this.getRandomPokemon(
          this.pokemonArrays[4],
          existingPokemons
        );
        gameLevelPokemons.push(
          this.createGameLevelPokemon(savedLevel, pokemon4, 6)
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
        for (let i = 0; i < 1; i++) {
          const pokemon = this.getRandomPokemon(
            this.pokemonArrays[3],
            existingPokemons
          );
          gameLevelPokemons.push(
            this.createGameLevelPokemon(savedLevel, pokemon, i + 1)
          );
          existingPokemons.push(pokemon);
        }
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
        const pokemon5 = this.getRandomPokemon(
          this.pokemonArrays[5],
          existingPokemons
        );
        gameLevelPokemons.push(
          this.createGameLevelPokemon(savedLevel, pokemon5, 6)
        );
        break;
      case 9:
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
      case 10:
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
      case 11:
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
      case 12:
        for (let i = 0; i < 1; i++) {
          const pokemon = this.getRandomPokemon(
            this.pokemonArrays[6],
            existingPokemons
          );
          gameLevelPokemons.push(
            this.createGameLevelPokemon(savedLevel, pokemon, i + 1)
          );
          existingPokemons.push(pokemon);
        }
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
      case 13:
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
      case 14:
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
        const pokemon8 = this.getRandomPokemon(
          this.pokemonArrays[10],
          existingPokemons
        );
        gameLevelPokemons.push(
          this.createGameLevelPokemon(savedLevel, pokemon8, 6)
        );
        break;
      case 15:
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
      case 16:
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
      case 17:
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
      case 18:
        for (let i = 0; i < 1; i++) {
          const pokemon = this.getRandomPokemon(
            this.pokemonArrays[8],
            existingPokemons
          );
          gameLevelPokemons.push(
            this.createGameLevelPokemon(savedLevel, pokemon, i + 1)
          );
          existingPokemons.push(pokemon);
        }
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
      /*case 19:
        for (let i = 0; i < 6; i++) {
          const pokemon = this.getRandomPokemon(this.pokemonArrays[10]);
          gameLevelPokemons.push(
            this.createGameLevelPokemon(savedLevel, pokemon, i + 1)
          );
        }
        break;*/
    }

    await this.gameLevelPokemonRepository.save(gameLevelPokemons);
  }
}

const gameLevelService = new GameLevelService();

export { gameLevelService };
