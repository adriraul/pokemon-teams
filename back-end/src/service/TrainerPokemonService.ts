import { AppDataSource } from "../data-source";
import { Box } from "../entity/Box";
import { Team } from "../entity/Team";
import { TrainerPokemon } from "../entity/TrainerPokemon";
import { gameLevelService } from "./GameLevelService";

export class TrainerPokemonService {
  private trainerPokemonRepository =
    AppDataSource.getRepository(TrainerPokemon);
  private boxRepository = AppDataSource.getRepository(Box);
  private teamRepository = AppDataSource.getRepository(Team);

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

  async dragPokemonInTeam(req: any, res: any) {
    try {
      const { trainerPokemonId, orderInTeam, teamId } = req.body;

      const trainerPokemon = await this.trainerPokemonRepository.findOne({
        where: { id: parseInt(trainerPokemonId) },
      });

      if (!trainerPokemon) {
        throw new Error("Trainer Pokemon not found");
      }

      const team = await this.teamRepository.findOne({
        where: { id: parseInt(teamId) },
        relations: ["trainerPokemons"],
      });

      if (!team) {
        throw new Error("Box not found");
      }

      const currentOrderInTeam = trainerPokemon.orderInTeam;
      trainerPokemon.orderInTeam = orderInTeam;

      const trainerPokemonInNewOrder = team.trainerPokemons.find(
        (trainerPokemon) => trainerPokemon.orderInTeam === orderInTeam
      );

      if (trainerPokemonInNewOrder) {
        trainerPokemonInNewOrder.orderInTeam = currentOrderInTeam;
        await this.trainerPokemonRepository.save(trainerPokemonInNewOrder);
      }

      return await this.trainerPokemonRepository.save(trainerPokemon);
    } catch (error) {
      throw new Error("Could not drag Pokemon in box");
    }
  }

  async movePokemonFromTeamToBox(req: any, res: any) {
    try {
      const userId = parseInt(req.user.userId);

      if (await gameLevelService.getGameLevelActiveByUser(userId)) {
        res.status(400).json({ error: "The user is in a game level." });
        return;
      }

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

      const currentOrderInTeam = trainerPokemon.orderInTeam;
      const currentTeamId = trainerPokemon.teamId;
      trainerPokemon.team = null;
      trainerPokemon.orderInTeam = null;
      trainerPokemon.box = box;
      trainerPokemon.orderInBox = orderInBox;

      const trainerPokemonInNewOrder = box.trainerPokemons.find(
        (trainerPokemon) => trainerPokemon.orderInBox === orderInBox
      );

      if (trainerPokemonInNewOrder) {
        trainerPokemonInNewOrder.orderInTeam = currentOrderInTeam;
        trainerPokemonInNewOrder.teamId = currentTeamId;
        trainerPokemonInNewOrder.orderInBox = null;
        trainerPokemonInNewOrder.box = null;
        await this.trainerPokemonRepository.save(trainerPokemonInNewOrder);
      }

      return await this.trainerPokemonRepository.save(trainerPokemon);
    } catch (error) {
      throw new Error("Could not drag Pokemon from team to box");
    }
  }

  async movePokemonFromBoxToTeam(req: any, res: any) {
    try {
      const userId = parseInt(req.user.userId);

      if (await gameLevelService.getGameLevelActiveByUser(userId)) {
        res.status(400).json({ error: "The user is in a game level." });
        return;
      }

      const { trainerPokemonId, orderInTeam, teamId } = req.body;
      const trainerPokemon = await this.trainerPokemonRepository.findOne({
        where: { id: parseInt(trainerPokemonId) },
      });

      if (!trainerPokemon) {
        throw new Error("Trainer Pokemon not found");
      }

      const team = await this.teamRepository.findOne({
        where: { id: parseInt(teamId) },
        relations: ["trainerPokemons"],
      });

      if (!team) {
        throw new Error("Box not found");
      }

      const currentOrderInBox = trainerPokemon.orderInBox;
      const currentBoxId = trainerPokemon.boxId;
      trainerPokemon.box = null;
      trainerPokemon.orderInBox = null;
      trainerPokemon.teamId = teamId;
      trainerPokemon.orderInTeam = orderInTeam;

      const trainerPokemonInNewOrder = team.trainerPokemons.find(
        (trainerPokemon) => trainerPokemon.orderInTeam === orderInTeam
      );

      if (trainerPokemonInNewOrder) {
        trainerPokemonInNewOrder.orderInTeam = null;
        trainerPokemonInNewOrder.teamId = null;
        trainerPokemonInNewOrder.orderInBox = currentOrderInBox;
        trainerPokemonInNewOrder.boxId = currentBoxId;
        await this.trainerPokemonRepository.save(trainerPokemonInNewOrder);
      }

      return await this.trainerPokemonRepository.save(trainerPokemon);
    } catch (error) {
      throw new Error("Could not drag Pokemon from team to box");
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

  async getTrainerPokemonsByUserId(userId: number) {
    const trainerPokemons = await this.trainerPokemonRepository.find({
      where: { user: { id: userId } },
      relations: ["pokemon", "movements"],
    });
    return trainerPokemons;
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
