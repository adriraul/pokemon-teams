import { AppDataSource } from "../data-source";
import { TrainerPokemon } from "../entity/TrainerPokemon";

export class TrainerPokemonService {
  private trainerPokemonRepository =
    AppDataSource.getRepository(TrainerPokemon);

  async getAllTrainerPokemons() {
    return this.trainerPokemonRepository.find({
      relations: ["trainerPokemons", "trainerPokemons.pokemon"],
    });
  }

  async getTrainerPokemonById(id: number) {
    return this.trainerPokemonRepository.findOne({
      where: { id },
      relations: ["pokemon"],
    });
  }

  async update(
    trainerPokemonId: string,
    updateFields: Partial<TrainerPokemon>
  ) {
    try {
      const trainerPokemon = await this.trainerPokemonRepository.findOne({
        where: { id: parseInt(trainerPokemonId) },
      });

      if (!trainerPokemon) {
        throw new Error("Trainer Pokemon not found");
      }

      Object.assign(trainerPokemon, updateFields);
      return await this.trainerPokemonRepository.save(trainerPokemon);
    } catch (error) {
      throw new Error("Could not update Trainer Pokemon");
    }
  }

  async removeTrainerPokemon(id: number) {
    const trainerPokemonToRemove = await this.trainerPokemonRepository.findOne({
      where: { id },
    });
    if (!trainerPokemonToRemove) {
      return "TrainerPokemon not found";
    }

    await this.trainerPokemonRepository.remove(trainerPokemonToRemove);
    return "TrainerPokemon has been removed";
  }
}

const trainerPokemonService = new TrainerPokemonService();

export { trainerPokemonService };
