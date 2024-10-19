import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Box } from "../entity/Box";
import { Team } from "../entity/Team";
import { TrainerPokemon } from "../entity/TrainerPokemon";
import { gameLevelService } from "./GameLevelService";
import { Movement } from "../entity/Movement";

export class TrainerPokemonService {
  private trainerPokemonRepository =
    AppDataSource.getRepository(TrainerPokemon);
  private boxRepository = AppDataSource.getRepository(Box);
  private teamRepository = AppDataSource.getRepository(Team);
  private movementRepository = AppDataSource.getRepository(Movement);

  async getAllTrainerPokemons() {
    return this.trainerPokemonRepository.find({
      relations: ["trainerPokemons", "trainerPokemons.pokemon"],
    });
  }

  async getAllTrainerPokemonLaboratory(userId: number) {
    return this.trainerPokemonRepository.find({
      where: { user: { id: userId } },
      relations: [
        "pokemon",
        "pokemon.pokemonTypes",
        "movements",
        "movements.pokemonType",
      ],
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

  async dragPokemonInBox(req: Request, res: Response) {
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

  async dragPokemonInTeam(req: Request, res: Response) {
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

  async movePokemonFromTeamToBox(req: Request, res: Response) {
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

  async movePokemonFromBoxToTeam(req: Request, res: Response) {
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

  async getMergeResults(req: Request, res: Response) {
    const { firstPokemonId, secondPokemonId } = req.body;

    // Validaciones
    if (firstPokemonId === secondPokemonId) {
      res.status(400).json({ message: "Cannot merge the same Pokémon" });
      return;
    }

    const firstPokemon = await this.trainerPokemonRepository.findOne({
      where: { id: firstPokemonId },
      relations: [
        "pokemon",
        "pokemon.pokemonTypes",
        "movements",
        "movements.pokemonType",
      ],
    });

    const secondPokemon = await this.trainerPokemonRepository.findOne({
      where: { id: secondPokemonId },
      relations: [
        "pokemon",
        "pokemon.pokemonTypes",
        "movements",
        "movements.pokemonType",
      ],
    });

    if (!firstPokemon || !secondPokemon) {
      res.status(404).json({ message: "One or both Pokémon not found" });
      return;
    }

    const firstPokemonTypes = firstPokemon.pokemon.pokemonTypes.map(
      (type) => type.name
    );
    const secondPokemonTypes = secondPokemon.pokemon.pokemonTypes.map(
      (type) => type.name
    );

    const commonTypes = firstPokemonTypes.filter((type) =>
      secondPokemonTypes.includes(type)
    );

    if (commonTypes.length === 0) {
      res.status(400).json({ message: "Pokémon do not share any types" });
      return;
    }

    const mergeResults: string[] = [];

    // 1. Calcular movimientos (movements)
    const firstPower = firstPokemon.pokemon.power;
    const secondPower = secondPokemon.pokemon.power;

    console.log(commonTypes);

    commonTypes.forEach((type) => {
      // Encontrar los movimientos del segundo Pokémon que sean de este tipo
      const secondPokemonMove = secondPokemon.movements.find(
        (move) => move.pokemonType.name === type
      );
      if (secondPokemonMove) {
        let movementsToAdd = 0;

        // Si tienen el mismo poder, sumar la mitad de los movimientos
        if (firstPower === secondPower) {
          movementsToAdd = Math.floor(secondPokemonMove.quantity * 0.75);
        }
        // Si el segundo Pokémon tiene menos poder, restar movimientos
        else if (secondPower < firstPower) {
          const powerDifference = firstPower - secondPower;
          movementsToAdd =
            Math.floor(secondPokemonMove.quantity * 0.75) - powerDifference;
        }
        // Si el segundo Pokémon tiene más poder, sumar movimientos
        else {
          const powerDifference = secondPower - firstPower;
          movementsToAdd =
            Math.floor(secondPokemonMove.quantity * 0.75) + powerDifference;
        }

        // Si hay movimientos a añadir, los sumamos al primer Pokémon
        if (movementsToAdd > 0) {
          mergeResults.push(
            `+${movementsToAdd} ${type} moves to ${firstPokemon.pokemon.name}`
          );
        }
      }
    });

    let ivToAdd = 0;
    if (firstPower === secondPower) {
      ivToAdd = 2;
    } else if (secondPower < firstPower) {
      ivToAdd = 1;
    } else {
      ivToAdd = 3;
    }

    mergeResults.push(`+${ivToAdd} PS IV to ${firstPokemon.pokemon.name}`);
    mergeResults.push(`+${ivToAdd} Attack IV to ${firstPokemon.pokemon.name}`);
    mergeResults.push(`+${ivToAdd} Defense IV to ${firstPokemon.pokemon.name}`);

    mergeResults.push(`${secondPokemon.nickname} will be released`);

    res.status(200).json(mergeResults);
    return;
  }

  async merge(req: Request, res: Response) {
    const { firstPokemonId, secondPokemonId } = req.body;

    // Validaciones
    if (firstPokemonId === secondPokemonId) {
      res.status(400).json({ message: "Cannot merge the same Pokémon" });
      return;
    }

    const firstPokemon = await this.trainerPokemonRepository.findOne({
      where: { id: firstPokemonId },
      relations: [
        "pokemon",
        "pokemon.pokemonTypes",
        "movements",
        "movements.pokemonType",
      ],
    });

    const secondPokemon = await this.trainerPokemonRepository.findOne({
      where: { id: secondPokemonId },
      relations: [
        "pokemon",
        "pokemon.pokemonTypes",
        "movements",
        "movements.pokemonType",
      ],
    });

    if (!firstPokemon || !secondPokemon) {
      res.status(404).json({ message: "One or both Pokémon not found" });
      return;
    }

    const firstPokemonTypes = firstPokemon.pokemon.pokemonTypes.map(
      (type) => type.name
    );
    const secondPokemonTypes = secondPokemon.pokemon.pokemonTypes.map(
      (type) => type.name
    );

    const commonTypes = firstPokemonTypes.filter((type) =>
      secondPokemonTypes.includes(type)
    );

    if (commonTypes.length === 0) {
      res.status(400).json({ message: "Pokémon do not share any types" });
      return;
    }

    // 1. Calcular movimientos (movements)
    const firstPower = firstPokemon.pokemon.power;
    const secondPower = secondPokemon.pokemon.power;

    commonTypes.forEach(async (type) => {
      // Encontrar los movimientos del segundo Pokémon que sean de este tipo
      const secondPokemonMove = secondPokemon.movements.find(
        (move) => move.pokemonType.name === type
      );
      if (secondPokemonMove) {
        let movementsToAdd = 0;

        // Si tienen el mismo poder, sumar la mitad de los movimientos
        if (firstPower === secondPower) {
          movementsToAdd = Math.floor(secondPokemonMove.quantity * 0.75);
        }
        // Si el segundo Pokémon tiene menos poder, restar movimientos
        else if (secondPower < firstPower) {
          const powerDifference = firstPower - secondPower;
          movementsToAdd =
            Math.floor(secondPokemonMove.quantity * 0.75) - powerDifference;
        }
        // Si el segundo Pokémon tiene más poder, sumar movimientos
        else {
          const powerDifference = secondPower - firstPower;
          movementsToAdd =
            Math.floor(secondPokemonMove.quantity * 0.75) + powerDifference;
        }

        // Si hay movimientos a añadir, los sumamos al primer Pokémon
        if (movementsToAdd > 0) {
          const firstPokemonMove = firstPokemon.movements.find(
            (move) => move.pokemonType.name === type
          );
          if (firstPokemonMove) {
            firstPokemonMove.quantity += movementsToAdd;
            await this.movementRepository.save(firstPokemonMove);
          }
        }
      }
    });

    let ivToAdd = 0;
    if (firstPower === secondPower) {
      ivToAdd = 2;
    } else if (secondPower < firstPower) {
      ivToAdd = 1;
    } else {
      ivToAdd = 3;
    }

    firstPokemon.ivAttack += ivToAdd;
    firstPokemon.ivDefense += ivToAdd;
    firstPokemon.ivPS += ivToAdd;

    if (firstPokemon.ivAttack > 31) firstPokemon.ivAttack = 31;
    if (firstPokemon.ivDefense > 31) firstPokemon.ivDefense = 31;
    if (firstPokemon.ivPS > 31) firstPokemon.ivPS = 31;

    await this.trainerPokemonRepository.save(firstPokemon);
    await this.removeTrainerPokemon(secondPokemon.id);

    const firstPokemonResult = await this.trainerPokemonRepository.findOne({
      where: { id: firstPokemonId },
      relations: [
        "pokemon",
        "pokemon.pokemonTypes",
        "movements",
        "movements.pokemonType",
      ],
    });

    res.status(200).json(firstPokemonResult);
    return;
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
