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
    const { username, password } = req.body;
    const user = await this.userRepository.findOne({ where: { username } });

    if (!user || !bcrypt.compareSync(password, user.password)) {
      res.status(401).json({ error: "Credenciales inválidas" });
      return;
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({ token });
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
      ],
    });
  }

  async register(userData: any) {
    const { username, password, email } = userData;
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User();
    user.username = username;
    user.password = hashedPassword;
    user.email = email;

    const savedUser = await this.userRepository.save(user);
    return savedUser;
  }

  async addPokemonToUser(req: Request, res: Response) {
    const pokemonPokedexId = parseInt(req.query.pokedexId);
    const userId = parseInt(req.user.userId);

    const pokemonToAdd = await pokemonService.findByPokedexId(pokemonPokedexId);

    if (!pokemonToAdd) {
      throw "Bad Request, the user or pokemon doesn't exist";
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
      return "All boxes are full.";
    }

    return this.getUserById(user.id);
  }

  async removePokemonFromUser(req: Request, res: Response) {
    const trainerPokemonId = parseInt(req.query.trainerPokemonId);
    const userId = parseInt(req.user.userId);
    const user = await this.getUserById(userId);

    const pokemonTrainerToRemove = user.trainerPokemons.find(
      (pokemons) => pokemons.id === trainerPokemonId
    );

    if (!pokemonTrainerToRemove) {
      return "This pokemon doesn't exists in the user.";
    }

    await trainerPokemonService.removeTrainerPokemon(pokemonTrainerToRemove.id);

    return this.getUserById(userId);
  }

  async removeUser(id: number) {
    const userToRemove = await this.userRepository.findOne({ where: { id } });
    if (!userToRemove) {
      return "User not found";
    }

    await this.userRepository.remove(userToRemove);
    return "User has been removed";
  }
}

const userService = new UserService();

export { userService };
