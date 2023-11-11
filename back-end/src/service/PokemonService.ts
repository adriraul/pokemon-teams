import { AppDataSource } from "../data-source"
import { Pokemon } from '../entity/Pokemon';

export class PokemonService {
    private pokemonRepository = AppDataSource.getRepository(Pokemon)

  async getAllPokemons() {
    return this.pokemonRepository.find(
        { relations: {
        pokemonTypes: true,
      },
    });
  }

  async getPokemonById(id: number) {
    const pokemon = await this.pokemonRepository.findOne({ 
        where: { id }, 
        relations: {
          pokemonTypes: true,
        }, 
      });
    return pokemon;
  }

  async findByPokedexId(pokedexId: number): Promise<Pokemon | undefined> {
    try {
      return await this.pokemonRepository.findOne({
        where: { pokedex_id: pokedexId },
        relations: {
          pokemonTypes: true,
        },
      });
    } catch (error) {
      throw error;
    }
  }

  async saveAllPokemons(pokemonList: any[]) {
    try {
      const savedPokemonList = await Promise.all(
        pokemonList.map(async (pokemonData) => {
          const pokemon = new Pokemon();
          pokemon.pokedex_id = pokemonData.pokedex_id;
          pokemon.name = pokemonData.name;
          pokemon.photo = pokemonData.photo;
          pokemon.pokemonTypes = pokemonData.pokemonTypes;

          return await this.pokemonRepository.save(pokemon);
        })
      );

      return savedPokemonList;
    } catch (error) {
      return error;
    }
  }

  async savePokemon(pokemonData: any) {
    const { pokedex_id, name, photo, pokemonTypes } = pokemonData;
    const pokemon = new Pokemon();
    pokemon.pokedex_id = pokedex_id;
    pokemon.name = name;
    pokemon.photo = photo;
    pokemon.pokemonTypes = pokemonTypes;

    const savedPokemon = await this.pokemonRepository.save(pokemon);
    return savedPokemon;
  }

  async removePokemon(id: number) {
    const pokemonToRemove = await this.pokemonRepository.findOne({ where: { id } });
    if (!pokemonToRemove) {
      return "This Pokemon does not exist";
    }

    await this.pokemonRepository.remove(pokemonToRemove);
    return "Pokemon has been removed";
  }
}

const pokemonService = new PokemonService();

export {
  pokemonService,
};
