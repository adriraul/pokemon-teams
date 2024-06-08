import { AppDataSource } from "../data-source";
import { Box } from "../entity/Box";
import { TrainerPokemon } from "../entity/TrainerPokemon";

export class TrainerPokemonService {
  private trainerPokemonRepository =
    AppDataSource.getRepository(TrainerPokemon);
  private boxRepository = AppDataSource.getRepository(Box);

  async getAllTrainerPokemons() {
    return this.trainerPokemonRepository.find({
      relations: ["trainerPokemons", "trainerPokemons.pokemon"],
    });
  }

  async getTrainerPokemonById(id: number) {
    const trainerPokemon = await this.trainerPokemonRepository
      .createQueryBuilder("trainerPokemon")
      .leftJoinAndSelect("trainerPokemon.pokemon", "pokemon")
      .leftJoinAndSelect("pokemon.pokemonTypes", "pokemonTypes")
      .leftJoinAndSelect("trainerPokemon.movements", "movements")
      .where("trainerPokemon.id = :id", { id })
      .getOne();

    return trainerPokemon;
  }

  async dragPokemonInBox(req: any, res: any) {
    try {
      const { trainerPokemonId, orderInBox, boxId } = req.body;

      const trainerPokemon = await this.trainerPokemonRepository.findOne({
        where: { id: parseInt(trainerPokemonId) },
      });

      if (!trainerPokemon) {
        throw new Error("Trainer Pokemon not found");
      }

      const box = await this.boxRepository.findOne({
        where: { id: parseInt(boxId) },
        relations: ["trainerPokemons"],
      });

      if (!box) {
        throw new Error("Box not found");
      }

      const currentOrderInBox = trainerPokemon.orderInBox;
      trainerPokemon.orderInBox = orderInBox;

      const trainerPokemonInNewOrder = box.trainerPokemons.find(
        (trainerPokemon) => trainerPokemon.orderInBox === orderInBox
      );

      if (trainerPokemonInNewOrder) {
        trainerPokemonInNewOrder.orderInBox = currentOrderInBox;
        await this.trainerPokemonRepository.save(trainerPokemonInNewOrder);
      }

      return await this.trainerPokemonRepository.save(trainerPokemon);
    } catch (error) {
      throw new Error("Could not drag Pokemon in box");
    }
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
