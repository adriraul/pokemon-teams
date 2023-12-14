import { AppDataSource } from "../data-source";
import { PokemonTypes } from "../entity/PokemonTypes";

export class PokemonTypesService {
  private pokemonTypesRepository = AppDataSource.getRepository(PokemonTypes);

  async getAllPokemonTypes() {
    return this.pokemonTypesRepository.find();
  }

  async getPokemonTypeById(id: number) {
    const pokemonTypes = await this.pokemonTypesRepository.findOne({
      where: { id },
    });

    if (!pokemonTypes) {
      return "Unregistered PokemonTypes";
    }
    return pokemonTypes;
  }

  async savePokemonType(pokemonTypeData: any) {
    const { name } = pokemonTypeData;

    const pokemonType = Object.assign(new PokemonTypes(), {
      name,
    });

    return this.pokemonTypesRepository.save(pokemonType);
  }

  async saveAllPokemonTypes(pokemonTypeList: any[]) {
    try {
      const savedPokemonTypeList = await Promise.all(
        pokemonTypeList.map(async (pokemonTypeData) => {
          const pokemonType = new PokemonTypes();
          pokemonType.name = pokemonTypeData.name;
          pokemonType.id = pokemonTypeData.id;

          return await this.pokemonTypesRepository.save(pokemonType);
        })
      );

      return savedPokemonTypeList;
    } catch (error) {
      return error;
    }
  }

  async removePokemonType(id: number) {
    const pokemonTypesToRemove = await this.pokemonTypesRepository.findOne({
      where: { id },
    });
    if (!pokemonTypesToRemove) {
      return "This PokemonTypes does not exist";
    }

    await this.pokemonTypesRepository.remove(pokemonTypesToRemove);
    return "PokemonTypes has been removed";
  }
}

const pokemonTypesService = new PokemonTypesService();

export { pokemonTypesService };
