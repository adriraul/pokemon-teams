import { AppDataSource } from "../data-source";
import { Pokemon } from "../entity/Pokemon";
import { Request, Response } from "express";

interface ProbInfo {
  percentage: string;
  pokemons: string[];
}

export class PokemonService {
  private pokemonRepository = AppDataSource.getRepository(Pokemon);

  async getAllPokemons() {
    return this.pokemonRepository.find({
      relations: {
        pokemonTypes: true,
      },
      order: {
        pokedex_id: "ASC",
      },
    });
  }

  async getAllByPower(power: number) {
    return this.pokemonRepository.find({
      where: {
        power: power,
      },
      order: {
        pokedex_id: "ASC",
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

  async getProbsByPokeballType(req: Request, res: Response) {
    const pokeballType = req.params.pokeballType;
    const probs: { [key: number]: ProbInfo } = {};

    if (pokeballType == "Pokeball") {
      probs[1] = {
        percentage: "30%",
        pokemons: await this.getPokedexIdByPower(3),
      };
      probs[2] = {
        percentage: "25%",
        pokemons: await this.getPokedexIdByPower(4),
      };
      probs[3] = {
        percentage: "20%",
        pokemons: await this.getPokedexIdByPower(5),
      };
      probs[4] = {
        percentage: "10%",
        pokemons: await this.getPokedexIdByPower(6),
      };
      probs[5] = {
        percentage: "3%",
        pokemons: await this.getPokedexIdByPower(8),
      };
      probs[6] = {
        percentage: "2%",
        pokemons: await this.getPokedexIdByPower(10),
      };
    } else if (pokeballType == "Greatball") {
      probs[1] = {
        percentage: "20%",
        pokemons: await this.getPokedexIdByPower(3),
      };
      probs[2] = {
        percentage: "15%",
        pokemons: await this.getPokedexIdByPower(4),
      };
      probs[3] = {
        percentage: "15%",
        pokemons: await this.getPokedexIdByPower(5),
      };
      probs[4] = {
        percentage: "30%",
        pokemons: await this.getPokedexIdByPower(6),
      };
      probs[5] = {
        percentage: "15%",
        pokemons: await this.getPokedexIdByPower(8),
      };
      probs[6] = {
        percentage: "5%",
        pokemons: await this.getPokedexIdByPower(10),
      };
    } else if (pokeballType == "Ultraball") {
      probs[1] = {
        percentage: "2%",
        pokemons: await this.getPokedexIdByPower(3),
      };
      probs[2] = {
        percentage: "3%",
        pokemons: await this.getPokedexIdByPower(4),
      };
      probs[3] = {
        percentage: "10%",
        pokemons: await this.getPokedexIdByPower(5),
      };
      probs[4] = {
        percentage: "40%",
        pokemons: await this.getPokedexIdByPower(6),
      };
      probs[5] = {
        percentage: "30%",
        pokemons: await this.getPokedexIdByPower(8),
      };
      probs[6] = {
        percentage: "15%",
        pokemons: await this.getPokedexIdByPower(10),
      };
    }

    if (!probs) {
      return "Unregistered pokeball";
    }

    return probs;
  }

  async getPokedexIdByPower(power: number): Promise<string[]> {
    return this.getAllByPower(power)
      .then((pokemonByPower: Pokemon[]) => {
        const pokemonList: string[] = pokemonByPower.map((pokemon) =>
          pokemon.pokedex_id.toString()
        );
        return pokemonList;
      })
      .catch((error) => {
        console.error("Error al obtener los Pokémon:", error);
        return [];
      });
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
          pokemon.power = pokemonData.power;
          pokemon.ps = 30 * pokemon.power;
          pokemon.invertedImage = pokemonData.invertedImage;

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
    const pokemonToRemove = await this.pokemonRepository.findOne({
      where: { id },
    });
    if (!pokemonToRemove) {
      return "This Pokemon does not exist";
    }

    await this.pokemonRepository.remove(pokemonToRemove);
    return "Pokemon has been removed";
  }
}

const pokemonService = new PokemonService();

export { pokemonService };
