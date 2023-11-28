import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Box } from "../entity/Box";
import { pokemonService } from "./PokemonService";
import { TrainerPokemon } from "../entity/TrainerPokemon";
import { userService } from "./UserService";

export class BoxService {
  private boxRepository = AppDataSource.getRepository(Box);

  async getAllBoxes() {
    return this.boxRepository.find({
      relations: ["pokemonsInBox", "pokemonsInBox.pokemon"],
    });
  }

  async getBoxById(id: number) {
    const box = await this.boxRepository.findOne({
      where: { id },
      relations: ["pokemonsInBox", "pokemonsInBox.pokemon"],
    });
    return box;
  }

  async saveBox(req: Request, res: Response) {
    const { name, space_limit } = req.body;
    const user = await userService.getUserById(req.user.userId);

    const box = new Box();
    box.name = name;
    box.space_limit = space_limit;
    box.user = user;

    return await this.boxRepository.save(box);
  }

  async addPokemonToBox(req: Request, res: Response) {
    const pokemonPokedexId = parseInt(req.requestQuery.pokedexId);
    const boxId = parseInt(req.requestQuery.boxId);

    const box = await this.getBoxById(boxId);
    const pokemonToAdd = await pokemonService.findByPokedexId(pokemonPokedexId);

    if (!box || !pokemonToAdd) {
      res.status(404).json("The box or the pokemon don't exist.");
      return;
    }

    const boxPokemonList = box.trainerPokemons;
    const existingPokemon = boxPokemonList.find(
      (pokemon) => pokemon.id === pokemonToAdd.id
    );
    if (existingPokemon) {
      res.status(404).json("This pokemon already exist in the box");
      return;
    }

    const trainerPokemon = new TrainerPokemon();
    trainerPokemon.boxId = box.id;
    trainerPokemon.pokemonId = pokemonToAdd.id;
    trainerPokemon.level = 1;
    await this.boxRepository.manager.save(TrainerPokemon, trainerPokemon);

    return this.getBoxById(box.id);
  }

  async removeBox(req: Request, res: Response, id: number) {
    const boxToRemove = await this.boxRepository.findOne({ where: { id } });
    if (!boxToRemove) {
      res.status(404).json("This box doesn't exist.");
      return;
    }

    await this.boxRepository.remove(boxToRemove);
    return "Box has been removed";
  }
}

const boxService = new BoxService();

export { boxService };
