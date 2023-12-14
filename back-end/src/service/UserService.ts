import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { TrainerPokemon } from "../entity/TrainerPokemon";
import { User } from "../entity/User";
import { pokemonService } from "./PokemonService";
import * as jwt from "jsonwebtoken";
import * as bcrypt from "bcrypt";
import { trainerPokemonService } from "./TrainerPokemonService";

export class UserService {
  private userRepository = AppDataSource.getRepository(User);

  async login(req: Request, res: Response) {
    try {
      const { username, password } = req.body;
      const user = await this.userRepository.findOne({ where: { username } });

      if (!user || !bcrypt.compareSync(password, user.password)) {
        res.status(401).json({ error: "Bad credentials." });
        return;
      }

      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });

      res.json({ token });
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
        "boxes",
        "boxes.trainerPokemons",
        "teams",
        "teams.trainerPokemons",
      ],
    });
  }

  async register(req: Request, res: Response) {
    console.log(req.body);
    const { username, password, email } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User();
    user.username = username;
    user.password = hashedPassword;
    user.email = email;

    const savedUser = await this.userRepository.save(user);
    return savedUser;
  }

  async getAllPokemonsByUser(req: Request, res: Response) {
    const currentUser = await this.getUserById(parseInt(req.user.userId));
    return currentUser.trainerPokemons;
  }

  async getAllTeamsByUser(req: Request, res: Response) {
    const currentUser = await this.getUserById(parseInt(req.user.userId));
    return currentUser.teams;
  }

  async getAllBoxesByUser(req: Request, res: Response) {
    const currentUser = await this.getUserById(parseInt(req.user.userId));
    return currentUser.boxes;
  }

  async addPokemonToUser(req: Request, res: Response) {
    const pokemonPokedexId = parseInt(req.query.pokedexId);
    const userId = parseInt(req.user.userId);

    const pokemonToAdd = await pokemonService.findByPokedexId(pokemonPokedexId);

    if (!pokemonToAdd) {
      res.status(404).json({ error: "The user or pokemon doesn't exist" });
      return;
    }

    const user = await userService.getUserById(userId);

    const freeBox = user.boxes.find((box) => box.trainerPokemons.length < 30);

    if (freeBox) {
      const trainerPokemon = new TrainerPokemon();
      trainerPokemon.userId = user.id;
      trainerPokemon.pokemonId = pokemonToAdd.id;
      trainerPokemon.boxId = freeBox.id;
      trainerPokemon.level = 1;

      await this.userRepository.manager.save(TrainerPokemon, trainerPokemon);
    } else {
      res.status(400).json({ error: "All boxes are full." });
      return;
    }

    return this.getUserById(userId);
  }

  async removePokemonFromUser(req: Request, res: Response) {
    const trainerPokemonId = parseInt(req.query.trainerPokemonId);
    const userId = parseInt(req.user.userId);
    const user = await this.getUserById(userId);

    const pokemonTrainerToRemove = user.trainerPokemons.find(
      (pokemons) => pokemons.id === trainerPokemonId
    );

    if (!pokemonTrainerToRemove) {
      res
        .status(404)
        .json({ error: "This pokemon doesn't exists in the user." });
      return;
    }

    await trainerPokemonService.removeTrainerPokemon(pokemonTrainerToRemove.id);

    return this.getUserById(userId);
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
}

const userService = new UserService();

export { userService };
