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

  /*async save(req: Request, res: Response, next: NextFunction) {
    return await trainerPokemonService.saveTrainerPokemon(req.body);
  }*/

  /*async update(req: Request, res: Response, next: NextFunction) {
    return await trainerPokemonService.updateTrainerPokemon(req.body);
  }*/

  /*async updateNickname(req: Request, res: Response, next: NextFunction) {
    return await trainerPokemonService.updateNickname(req, res);
  }*/

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

  async remove(req: Request, res: Response, next: NextFunction) {
    const id = parseInt(req.params.id);
    return await trainerPokemonService.removeTrainerPokemon(id);
  }
}
