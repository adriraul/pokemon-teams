import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { TrainerPokemon } from "../entity/TrainerPokemon";
import { User } from "../entity/User";
import { pokemonService } from "./PokemonService";
import * as jwt from "jsonwebtoken";
import * as bcrypt from "bcrypt";
import { trainerPokemonService } from "./TrainerPokemonService";
import { boxService } from "./BoxService";
import { teamService } from "./TeamService";
import { promoCodesService } from "./PromoCodesService";
import { Pokemon } from "../entity/Pokemon";
import { TrainerPokedex } from "../entity/TrainerPokedex";
import { Movement } from "../entity/Movement";
import { gameLevelService } from "./GameLevelService";
import { Team } from "../entity/Team";
import { Box } from "../entity/Box";

export class UserService {
  private userRepository = AppDataSource.getRepository(User);
  private boxRepository = AppDataSource.getRepository(Box);
  private teamRepository = AppDataSource.getRepository(Team);
  private trainerPokedexRepository =
    AppDataSource.getRepository(TrainerPokedex);

  async login(req: Request, res: Response) {
    try {
      const { username, password } = req.body;
      const user = await this.userRepository
        .createQueryBuilder("user")
        .where("LOWER(user.username) = LOWER(:username)", { username })
        .getOne();

      if (!user || !bcrypt.compareSync(password, user.password)) {
        res.status(401).json({ error: "Bad credentials." });
        return;
      }

      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
        expiresIn: "8h",
      });

      const balance = user.balance;
      const userAvatar = user.profileImage;
      const badgesUnlocked = user.badgesUnlocked;

      res.json({ token, username, userAvatar, balance, badgesUnlocked });
    } catch (error) {
      res.status(500).json({ error: error });
    }
  }

  async getAllUsers() {
    return this.userRepository.find({
      relations: ["trainerPokemons", "trainerPokemons.pokemon"],
    });
  }

  async getUserById(id: number) {
    return this.userRepository.findOne({
      where: { id },
      relations: [
        "trainerPokemons",
        "trainerPokemons.pokemon",
        "trainerPokemons.movements",
        "trainerPokemons.movements.pokemonType",
        "boxes",
        "boxes.trainerPokemons.pokemon",
        "boxes.trainerPokemons.movements",
        "boxes.trainerPokemons.movements.pokemonType",
        "teams",
        "teams.trainerPokemons",
        "teams.trainerPokemons.pokemon",
        "teams.trainerPokemons.pokemon.pokemonTypes",
        "teams.trainerPokemons.movements",
        "teams.trainerPokemons.movements.pokemonType",
      ],
    });
  }

  async getSimpleUserById(id: number) {
    return this.userRepository.findOne({
      where: { id },
    });
  }

  async register(req: Request, res: Response) {
    const { username, password, email } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const defaultAccessories = {
      handAccessories: [
        { id: "none", unlocked: 1 },
        { id: "aceOfHearts", unlocked: 0 },
        { id: "charizardBalloon", unlocked: 0 },
        { id: "elegant", unlocked: 0 },
        { id: "boxingGloves", unlocked: 0 },
        { id: "masterBall", unlocked: 0 },
      ],
      headAccessories: [
        { id: "none", unlocked: 1 },
        { id: "christmas", unlocked: 0 },
        { id: "mew", unlocked: 0 },
        { id: "party", unlocked: 0 },
        { id: "skull", unlocked: 0 },
      ],
      feetAccessories: [
        { id: "none", unlocked: 1 },
        { id: "blueVans", unlocked: 0 },
        { id: "redVans", unlocked: 0 },
      ],
      mouthAccessories: [
        { id: "none", unlocked: 1 },
        { id: "cigarette", unlocked: 0 },
        { id: "hot", unlocked: 0 },
      ],
      eyesAccessories: [
        { id: "none", unlocked: 1 },
        { id: "diamond", unlocked: 0 },
        { id: "sharingan", unlocked: 0 },
      ],
    };

    const defaultBadgesUnlocked = "1:0,2:0,3:0,4:0,5:0,6:0,7:0,8:0";

    const user = new User();
    user.username = username.charAt(0).toUpperCase() + username.slice(1);
    user.password = hashedPassword;
    user.email = email;
    user.balance = 1000;
    user.accessories = JSON.stringify(defaultAccessories);
    user.badgesUnlocked = defaultBadgesUnlocked;

    const savedUser = await this.userRepository.save(user);
    await this.createTeam(user);
    await this.createBoxes(user);
    await gameLevelService.createLevels(savedUser);
    return savedUser;
  }

  async saveAvatar(req: Request, res: Response) {
    const { image, avatarOptions } = req.body;

    try {
      const userId = parseInt(req.user.userId);
      const user = await this.userRepository.findOne({
        where: { id: userId },
      });

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      user.profileImage = image;
      user.avatarOptions = avatarOptions;
      await this.userRepository.save(user);
      res.status(200).json({ success: true });
      return;
    } catch (error) {
      console.error("Error saving avatar:", error);
      res.status(500).json({ error: "Failed to save avatar" });
    }
  }

  async getAvatarOptions(req: Request, res: Response) {
    try {
      const userId = parseInt(req.user.userId);
      const user = await this.userRepository.findOne({
        where: { id: userId },
      });

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const avatarOptions = user.avatarOptions;
      res.status(200).json({ avatarOptions });
      return;
    } catch (error) {
      console.error("Error saving avatar:", error);
      res.status(500).json({ error: "Failed to save avatar" });
    }
  }

  async getUserUnlockedAccessories(req: Request, res: Response) {
    try {
      const userId = parseInt(req.user.userId);
      const user = await this.userRepository.findOne({
        where: { id: userId },
      });

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const accessories = user.accessories;
      res.status(200).json({ accessories });
      return;
    } catch (error) {
      console.error("Error saving avatar:", error);
      res.status(500).json({ error: "Failed to save avatar" });
    }
  }

  async getAllPokemonsByUser(req: Request, res: Response) {
    const currentUser = await this.getUserById(parseInt(req.user.userId));
    return currentUser.trainerPokemons;
  }

  async getPokedex(req: Request, res: Response) {
    const userId = parseInt(req.user.userId);
    const pokedex = await this.trainerPokedexRepository.find({
      where: { userId: userId },
    });
    return pokedex;
  }

  async getAllTeamsByUser(req: Request, res: Response) {
    return this.getUserTeams(parseInt(req.user.userId));
  }

  async getAllBoxesByUser(req: Request, res: Response) {
    return this.getUserBoxes(parseInt(req.user.userId));
  }

  async getUserBoxes(userId: number) {
    return this.boxRepository.find({
      where: { user: { id: userId } },
      relations: [
        "trainerPokemons",
        "trainerPokemons.pokemon",
        "trainerPokemons.movements",
        "trainerPokemons.movements.pokemonType",
      ],
    });
  }

  async getUserTeams(userId: number) {
    return this.teamRepository.find({
      where: { user: { id: userId } },
      relations: [
        "trainerPokemons",
        "trainerPokemons.pokemon",
        "trainerPokemons.pokemon.pokemonTypes",
        "trainerPokemons.movements",
        "trainerPokemons.movements.pokemonType",
      ],
    });
  }

  async getAllGameLevelsByUser(req: Request, res: Response) {
    const gameLevelsByUser = await gameLevelService.getGameLevelsByUser(
      parseInt(req.user.userId)
    );
    return gameLevelsByUser;
  }

  async getUserLevelByIdAndUserId(req: Request, res: Response) {
    try {
      const userId = parseInt(req.user.userId);
      const levelId = parseInt(req.params.levelId);
      const gameLevel = await gameLevelService.getGameLevelByIdAndUserId(
        levelId,
        userId
      );
      if (!gameLevel) {
        res.status(404).json({ error: "Incorrect game level" });
      } else {
        return gameLevel;
      }
    } catch (error) {
      res.status(505).json({ error: "Error" });
    }
  }

  async addPokemonToUser(req: Request, res: Response) {
    const pokemonPokedexId = parseInt(req.query.pokedexId);
    const userId = parseInt(req.user.userId);
    const pokemonToAdd = await pokemonService.findByPokedexId(pokemonPokedexId);
    const user = await userService.getUserById(userId);

    if (!pokemonToAdd || !user) {
      res.status(404).json({ error: "The user or pokemon doesn't exist" });
      return;
    }
    await this.insertPokemonToUser(res, pokemonToAdd, user);

    return this.getUserById(userId);
  }

  async insertPokemonToTrainerPokedex(
    res: Response,
    pokemonToAdd: any,
    userId: any
  ) {
    const existingPokemon = await this.trainerPokedexRepository.findOne({
      where: {
        pokemonId: pokemonToAdd.id,
        userId: userId,
      },
    });

    if (!existingPokemon) {
      const pokemon = new TrainerPokedex();
      pokemon.pokemonId = pokemonToAdd.id;
      pokemon.userId = userId;
      await this.trainerPokedexRepository.save(pokemon);
    }
  }

  async insertPokemonToUser(res: Response, pokemonToAdd: Pokemon, user: User) {
    const boxes = await this.getUserBoxes(user.id);
    const freeBox = boxes.find((box: Box) => box.trainerPokemons.length < 30);

    let trainerPokemon = new TrainerPokemon();
    if (freeBox) {
      trainerPokemon.userId = user.id;
      trainerPokemon.pokemonId = pokemonToAdd.id;
      trainerPokemon.boxId = freeBox.id;
      trainerPokemon.level = 1;
      trainerPokemon.orderInBox = freeBox.findFreeGap();
      trainerPokemon.nickname = pokemonToAdd.name;
      trainerPokemon.ivPS = Math.floor(Math.random() * 32);
      trainerPokemon.ivAttack = Math.floor(Math.random() * 32);
      trainerPokemon.ivDefense = Math.floor(Math.random() * 32);
      trainerPokemon.ps = pokemonToAdd.ps + trainerPokemon.ivPS * 2;

      trainerPokemon = await this.userRepository.manager.save(
        TrainerPokemon,
        trainerPokemon
      );

      await this.assignMovements(trainerPokemon);

      await this.insertPokemonToTrainerPokedex(res, pokemonToAdd, user.id);
    } else {
      res.status(400).json({ error: "All boxes are full." });
      return;
    }
    return await trainerPokemonService.getTrainerPokemonById(trainerPokemon.id);
  }

  async assignMovements(trainerPokemon: TrainerPokemon) {
    const trainerPokemonBD = await trainerPokemonService.getTrainerPokemonById(
      trainerPokemon.id
    );

    const pokemon = trainerPokemonBD.pokemon;
    const pokemonTypes = pokemon.pokemonTypes;
    const nTypes = pokemon.pokemonTypes.length;

    const totalMovements = 20;

    pokemonTypes.forEach((pokemonType) => {
      const movement = new Movement();
      movement.pokemonType = pokemonType;
      movement.quantity = totalMovements / nTypes;
      movement.trainerPokemon = trainerPokemonBD;
      this.userRepository.manager.save(Movement, movement);
    });
  }

  async assignPokemonToFirstTeam(req: Request, res: Response) {
    const trainerPokemonIdToTeam = parseInt(req.query.trainerPokemonIdToTeam);
    const userId = parseInt(req.user.userId);
    const trainerPokemons =
      await trainerPokemonService.getTrainerPokemonsByUserId(userId);

    if (await gameLevelService.getGameLevelActiveByUser(userId)) {
      res.status(400).json({ error: "The user is in a game level." });
      return;
    }

    const trainerPokemonToTeam = trainerPokemons.find(
      (trainerPokemon) => trainerPokemon.id == trainerPokemonIdToTeam
    );

    if (!trainerPokemonToTeam) {
      res
        .status(404)
        .json({ error: "The user or pokemon doesn't exist in the user." });
      return;
    }
    const userTeam = await teamService.getUserTeam(userId);
    let repeatedPokemon = false;
    userTeam.trainerPokemons.forEach((trainerPokemon) => {
      if (trainerPokemonToTeam.pokemon.id === trainerPokemon.pokemon.id) {
        repeatedPokemon = true;
      }
    });

    if (repeatedPokemon) {
      res.status(400).json({
        error:
          "You have a " +
          trainerPokemonToTeam.pokemon.name +
          " in your team already!",
      });
      return;
    }

    if (userTeam.trainerPokemons.length < 6) {
      trainerPokemonToTeam.box = null;
      trainerPokemonToTeam.team = userTeam;
      trainerPokemonToTeam.orderInTeam = userTeam.findFreeGap();
      trainerPokemonToTeam.orderInBox = null;

      await this.userRepository.manager.save(
        TrainerPokemon,
        trainerPokemonToTeam
      );
    } else {
      res.status(400).json({ error: "All teams are full." });
      return;
    }
    res.status(200).json({ success: "Assigned to team." });
    return;
  }

  async sendPokemonToFirstBox(req: Request, res: Response) {
    const trainerPokemonIdToBox = parseInt(req.query.trainerPokemonIdToBox);
    const userId = parseInt(req.user.userId);
    const userBoxes = await this.getUserBoxes(userId);

    if (await gameLevelService.getGameLevelActiveByUser(userId)) {
      res.status(400).json({ error: "The user is in a game level." });
      return;
    }

    const trainerPokemonToBox =
      await trainerPokemonService.getTrainerPokemonById(trainerPokemonIdToBox);

    if (!trainerPokemonToBox) {
      res
        .status(404)
        .json({ error: "The user or pokemon doesn't exist in the user." });
      return;
    }

    const freeBox = userBoxes.find((box) => box.trainerPokemons.length < 30);

    if (freeBox) {
      trainerPokemonToBox.box = freeBox;
      trainerPokemonToBox.orderInBox = freeBox.findFreeGap();
      trainerPokemonToBox.team = null;

      await this.userRepository.manager.save(
        TrainerPokemon,
        trainerPokemonToBox
      );
    } else {
      res.status(400).json({ error: "All teams are full." });
      return;
    }

    res.status(200).json({ success: "Assigned to team." });
    return;
  }

  async switchBoxForTeamPokemon(req: Request, res: Response) {
    const trainerPokemonIdToTeam = parseInt(req.query.trainerPokemonIdToTeam);
    const trainerPokemonIdToBox = parseInt(req.query.trainerPokemonIdToBox);

    const userId = parseInt(req.user.userId);
    const trainerPokemons =
      await trainerPokemonService.getTrainerPokemonsByUserId(userId);

    if (await gameLevelService.getGameLevelActiveByUser(userId)) {
      res.status(400).json({ error: "The user is in a game level." });
      return;
    }

    const trainerPokemonToTeam = trainerPokemons.find(
      (trainerPokemon) => trainerPokemon.id == trainerPokemonIdToTeam
    );

    const trainerPokemonToBox = trainerPokemons.find(
      (trainerPokemon) => trainerPokemon.id == trainerPokemonIdToBox
    );

    if (!trainerPokemonToTeam || !trainerPokemonToBox) {
      res
        .status(404)
        .json({ error: "The pokemon may don't exists in the user." });
      return;
    }
    const userTeam = await teamService.getUserTeam(userId);

    if (trainerPokemonToTeam.pokemon.id !== trainerPokemonToBox.pokemon.id) {
      let repeatedPokemon = false;
      userTeam.trainerPokemons.forEach((trainerPokemon) => {
        if (trainerPokemonToTeam.pokemon.id === trainerPokemon.pokemon.id) {
          repeatedPokemon = true;
        }
      });

      if (repeatedPokemon) {
        res.status(400).json({
          error:
            "You have a " +
            trainerPokemonToTeam.pokemon.name +
            " in your team already!",
        });
        return;
      }
    }

    const destinationBox = await boxService.getBoxById(
      trainerPokemonToTeam.boxId
    );
    const destinationOrderInTeam = trainerPokemonToBox.orderInTeam;
    const destinationOrderInBox = trainerPokemonToTeam.orderInBox;

    trainerPokemonToTeam.team = userTeam;
    trainerPokemonToTeam.orderInTeam = destinationOrderInTeam;
    trainerPokemonToTeam.orderInBox = null;
    trainerPokemonToTeam.box = null;

    await this.userRepository.manager.save(
      TrainerPokemon,
      trainerPokemonToTeam
    );

    trainerPokemonToBox.box = destinationBox;
    trainerPokemonToBox.orderInBox = destinationOrderInBox;
    trainerPokemonToBox.team = null;

    await this.userRepository.manager.save(TrainerPokemon, trainerPokemonToBox);
    res.status(200).json("Success!");
    return;
  }

  async openPokeball(req: Request, res: Response) {
    const userId = parseInt(req.user.userId);
    const pokeballType = req.body.pokeballType;
    const user = await this.getSimpleUserById(userId);

    if (!user) {
      res.status(404).json({ error: "The user doesn't exist." });
    }

    let pokeballPrice = 0;
    if (pokeballType == "Pokeball") {
      pokeballPrice = 100;
    } else if (pokeballType == "Greatball") {
      pokeballPrice = 150;
    } else {
      pokeballPrice = 200;
    }
    if (user.balance < pokeballPrice) {
      res
        .status(404)
        .json({ error: "The user balance is less than de pokeball price." });
    }

    const newBalance = user.balance - pokeballPrice;
    user.balance = newBalance;

    const randomPercentage = Math.floor(Math.random() * 100) + 1;
    let pokemonToAdd = new Pokemon();
    let pokemons: Pokemon[] | null = null;

    switch (pokeballType) {
      case "Pokeball":
        if (randomPercentage >= 1 && randomPercentage <= 2) {
          pokemons = await pokemonService.getAllByPower(10);
        } else if (randomPercentage > 2 && randomPercentage <= 5) {
          pokemons = await pokemonService.getAllByPower(8);
        } else if (randomPercentage > 5 && randomPercentage <= 25) {
          pokemons = await pokemonService.getAllByPower(6);
        } else if (randomPercentage > 25 && randomPercentage <= 45) {
          pokemons = await pokemonService.getAllByPower(5);
        } else if (randomPercentage > 45 && randomPercentage <= 70) {
          pokemons = await pokemonService.getAllByPower(4);
        } else if (randomPercentage > 70 && randomPercentage <= 100) {
          pokemons = await pokemonService.getAllByPower(3);
        }
        break;
      case "Greatball":
        if (randomPercentage >= 1 && randomPercentage <= 5) {
          pokemons = await pokemonService.getAllByPower(10);
        } else if (randomPercentage > 5 && randomPercentage <= 20) {
          pokemons = await pokemonService.getAllByPower(8);
        } else if (randomPercentage > 20 && randomPercentage <= 50) {
          pokemons = await pokemonService.getAllByPower(6);
        } else if (randomPercentage > 50 && randomPercentage <= 65) {
          pokemons = await pokemonService.getAllByPower(5);
        } else if (randomPercentage > 65 && randomPercentage <= 80) {
          pokemons = await pokemonService.getAllByPower(4);
        } else if (randomPercentage > 80 && randomPercentage <= 100) {
          pokemons = await pokemonService.getAllByPower(3);
        }
        break;
      case "Ultraball":
        if (randomPercentage >= 1 && randomPercentage <= 15) {
          pokemons = await pokemonService.getAllByPower(10);
        } else if (randomPercentage > 15 && randomPercentage <= 45) {
          pokemons = await pokemonService.getAllByPower(8);
        } else if (randomPercentage > 45 && randomPercentage <= 85) {
          pokemons = await pokemonService.getAllByPower(6);
        } else if (randomPercentage > 85 && randomPercentage <= 95) {
          pokemons = await pokemonService.getAllByPower(5);
        } else if (randomPercentage > 95 && randomPercentage <= 98) {
          pokemons = await pokemonService.getAllByPower(4);
        } else if (randomPercentage > 98 && randomPercentage <= 100) {
          pokemons = await pokemonService.getAllByPower(3);
        }
        break;
      default:
        res.status(500).json({ error: "Error." });
        return;
    }

    const index = Math.floor(Math.random() * pokemons.length);
    pokemonToAdd = pokemons[index];

    await this.userRepository.save(user);
    let newPokemonTrainer = new TrainerPokemon();
    newPokemonTrainer = await this.insertPokemonToUser(res, pokemonToAdd, user);

    if (newPokemonTrainer) {
      res.json({ newBalance, newPokemonTrainer });
    }
  }

  async redeemCode(req: Request, res: Response) {
    const userId = parseInt(req.user.userId);
    const code = req.query.code;
    const user = await this.getSimpleUserById(userId);

    const promoCode = await promoCodesService.getPromoCodeByCode(code);

    if (!promoCode) {
      res.status(404).json({ error: "The code is invalid." });
      return;
    }

    const currentDate = new Date();
    const expirationDate = new Date(promoCode.expirationDate);

    if (currentDate > expirationDate) {
      res.status(404).json({ error: "The code has expired." });
      return;
    }

    const newBalance = user.balance + promoCode.amount;
    user.balance = newBalance;
    await this.userRepository.save(user);

    res.json({ newBalance });
  }

  async removePokemonFromUser(req: Request, res: Response) {
    const trainerPokemonId = parseInt(req.query.trainerPokemonId);
    const userId = parseInt(req.user.userId);
    const trainerPokemons =
      await trainerPokemonService.getTrainerPokemonsByUserId(userId);

    const pokemonTrainerToRemove = trainerPokemons.find(
      (pokemons) => pokemons.id === trainerPokemonId
    );

    if (!pokemonTrainerToRemove) {
      res
        .status(404)
        .json({ error: "This pokemon doesn't exists in the user." });
      return;
    }

    const maxMoves = 40;
    const basePrice = (pokemonTrainerToRemove.pokemon.power / 2) * 45 - 1;

    const totalMoves = pokemonTrainerToRemove.movements.reduce(
      (total, movement) => {
        return total + movement.quantity;
      },
      0
    );

    const movesRemaining = maxMoves - totalMoves;
    const percentageRemaining = movesRemaining / maxMoves;
    const discount = percentageRemaining / 2;
    const finalPrice = Math.round(basePrice * (1 - discount));

    const newBalance = await this.addBalanceToUser(userId, finalPrice);
    await trainerPokemonService.removeTrainerPokemon(pokemonTrainerToRemove.id);

    res.status(200).json({ balance: newBalance });
    return;
  }

  async addBalanceToUser(
    userId: number,
    balanceToAdd: number
  ): Promise<number> {
    const user = await this.getSimpleUserById(userId);
    user.balance += balanceToAdd;
    await this.userRepository.save(user);
    return user.balance;
  }

  async isUserTeamAbleToPlayLevel(req: Request, res: Response) {
    const userId = parseInt(req.user.userId);
    const levelActive = await gameLevelService.getGameLevelActiveByUser(userId);
    if (!levelActive) {
      const team = await teamService.getUserTeam(userId);

      if (!team) {
        res.status(404).json({ error: "The team doesn't exist." });
        return;
      }

      if (team.trainerPokemons.length < 6) {
        res.status(200).json({ ableToPlay: false });
        return;
      }

      let hasMovements = true;

      team.trainerPokemons.forEach((pokemon) => {
        let missingAllMovements = true;
        pokemon.movements.forEach((movement) => {
          if (movement.quantity > 0) {
            missingAllMovements = false;
          }
        });
        if (missingAllMovements) {
          hasMovements = false;
        }
      });

      if (!hasMovements) {
        res.status(200).json({ ableToPlay: false });
        return;
      }
    }
    res.status(200).json({ ableToPlay: true });
    return;
  }

  async removeUser(req: Request, res: Response) {
    const id = parseInt(req.params.id);
    const userToRemove = await this.userRepository.findOne({ where: { id } });
    if (!userToRemove) {
      res.status(404).json({ error: "User not found. " });
      return;
    }

    await this.userRepository.remove(userToRemove);
    return "User has been removed";
  }

  async createTeam(user: User) {
    const team = new Team();
    team.user = user;
    team.name = user.username + "'s team";
    await this.teamRepository.save(team);
  }

  async createBoxes(user: User) {
    for (let i = 1; i < 31; i++) {
      const box = new Box();
      box.user = user;
      box.name = `Box ${i}`;
      box.space_limit = 30;
      await this.boxRepository.save(box);
    }
  }
}

const userService = new UserService();

export { userService };
