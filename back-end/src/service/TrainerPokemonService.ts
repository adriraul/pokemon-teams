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
    });
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
