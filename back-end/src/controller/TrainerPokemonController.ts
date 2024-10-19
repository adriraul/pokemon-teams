import { NextFunction, Request, Response } from "express";
import { trainerPokemonService } from "../service/TrainerPokemonService";

export class TrainerPokemonController {
  async all(req: Request, res: Response, next: NextFunction) {
    return trainerPokemonService.getAllTrainerPokemons();
  }

  async one(req: Request, res: Response, next: NextFunction) {
    const id = parseInt(req.params.id);
    return await trainerPokemonService.getTrainerPokemonById(id);
  }

  async dragPokemonInBox(req: Request, res: Response, next: NextFunction) {
    return await trainerPokemonService.dragPokemonInBox(req, res);
  }

  async dragPokemonInTeam(req: Request, res: Response, next: NextFunction) {
    return await trainerPokemonService.dragPokemonInTeam(req, res);
  }

  async movePokemonFromTeamToBox(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    return await trainerPokemonService.movePokemonFromTeamToBox(req, res);
  }

  async movePokemonFromBoxToTeam(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    return await trainerPokemonService.movePokemonFromBoxToTeam(req, res);
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const trainerPokemonId = req.params.id;
      const updateFields = req.body;

      const updatedTrainerPokemon = await trainerPokemonService.update(
        trainerPokemonId,
        updateFields
      );

      res.status(200).json(updatedTrainerPokemon);
    } catch (error) {
      next(error);
    }
  }

  async getMergeResults(req: Request, res: Response) {
    return await trainerPokemonService.getMergeResults(req, res);
  }

  async merge(req: Request, res: Response) {
    return await trainerPokemonService.merge(req, res);
  }

  async remove(req: Request, res: Response, next: NextFunction) {
    const id = parseInt(req.params.id);
    return await trainerPokemonService.removeTrainerPokemon(id);
  }
}
