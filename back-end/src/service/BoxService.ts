import { AppDataSource } from "../data-source";
import { Box } from "../entity/Box";
import { pokemonService } from "./PokemonService";
import { TrainerPokemon } from "../entity/TrainerPokemon";

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

  async saveBox(boxData: any) {
    const { name, space_limit, user } = boxData;

    const box = new Box();
    box.name = name;
    box.space_limit = space_limit;
    box.user = user;

    return await this.boxRepository.save(box);
  }

  async addPokemonToBox(requestQuery: any) {
    const pokemonPokedexId = parseInt(requestQuery.pokedexId);
    const boxId = parseInt(requestQuery.boxId);

    const box = await this.getBoxById(boxId);
    const pokemonToAdd = await pokemonService.findByPokedexId(pokemonPokedexId);

    if (!box || !pokemonToAdd) {
      return "Bad Request";
    }

    const boxPokemonList = box.trainerPokemons;
    const existingPokemon = boxPokemonList.find(
      (pokemon) => pokemon.id === pokemonToAdd.id
    );
    if (existingPokemon) {
      return "This pokemon already exist in the box";
    }

    const trainerPokemon = new TrainerPokemon();
    trainerPokemon.boxId = box.id;
    trainerPokemon.pokemonId = pokemonToAdd.id;
    trainerPokemon.level = 1;
    await this.boxRepository.manager.save(TrainerPokemon, trainerPokemon);

    return this.getBoxById(box.id);
  }

  async removeBox(id: number) {
    const boxToRemove = await this.boxRepository.findOne({ where: { id } });
    if (!boxToRemove) {
      return "This Box does not exist";
    }

    await this.boxRepository.remove(boxToRemove);
    return "Box has been removed";
  }
}

const boxService = new BoxService();

export { boxService };
