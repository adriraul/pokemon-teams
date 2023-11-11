import { AppDataSource } from "../data-source"
import { Box } from '../entity/Box';
import { pokemonService } from "./PokemonService";
import { PokemonInBox } from "../entity/PokemonInBox";

export class BoxService {
    private boxRepository = AppDataSource.getRepository(Box)

  async getAllBoxes() {
    return this.boxRepository.find(
        { relations: ['pokemonsInBox', 'pokemonsInBox.pokemon'],
    });
  }

  async getBoxById(id: number) {
    const box = await this.boxRepository.findOne({ 
        where: { id }, 
        relations: ['pokemonsInBox', 'pokemonsInBox.pokemon'], 
      });
    return box;
  }

  async saveBox(boxData: any) {
    const { name, space_limit, pokemonsInBox } = boxData;
      
    const box = new Box();
    box.name = name;
    box.space_limit = space_limit;
  
    const savedBox = await this.boxRepository.save(box);

    for (const pokemonInBox of pokemonsInBox) {
      const storedPokemon = await pokemonService.findByPokedexId(pokemonInBox.pokedex_id);
      if (storedPokemon) {
        const pokemonInBox = new PokemonInBox();
        pokemonInBox.pokemonId = storedPokemon.id;
        pokemonInBox.level = 0;
        pokemonInBox.boxId = savedBox.id;

        await this.boxRepository.manager.save(PokemonInBox, pokemonInBox);
      }
    }

    return this.getBoxById(savedBox.id);
  }

  async addPokemonToBox(requestQuery: any) {
    const pokemonPokedexId = parseInt(requestQuery.pokedexId);
    const boxId = parseInt(requestQuery.boxId);
      
    const box = await this.getBoxById(boxId);
    const pokemonToAdd = await pokemonService.findByPokedexId(pokemonPokedexId);

    if(!box || !pokemonToAdd) {
        return "Bad Request";
    }

    const boxPokemonList = box.pokemonsInBox;
    const existingPokemon = boxPokemonList.find((pokemon) => pokemon.id === pokemonToAdd.id);
    if(existingPokemon) {
        return "This pokemon already exist in the box";
    }

    const pokemonInBox = new PokemonInBox();
    pokemonInBox.boxId = box.id;
    pokemonInBox.pokemonId = pokemonToAdd.id;
    pokemonInBox.level = 0;
    await this.boxRepository.manager.save(PokemonInBox, pokemonInBox);
  
    return this.getBoxById(box.id);
  }

  async removePokemonFromBox(requestQuery: any) {
    const pokemonPokedexId = parseInt(requestQuery.pokedexId);
    const boxId = parseInt(requestQuery.boxId);
      
    const box = await this.getBoxById(boxId);

    const pokemonToRemove = box.pokemonsInBox.find((pokemons) => pokemons.pokemon.pokedex_id === pokemonPokedexId);

    if(!pokemonToRemove) {
      return "This pokemon does't exists in the box.";
    }

    await this.boxRepository.manager.delete(PokemonInBox, pokemonToRemove);

    return this.getBoxById(boxId);
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

export {
  boxService,
};
