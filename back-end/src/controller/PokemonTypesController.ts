import { AppDataSource } from "../data-source";
import { NextFunction, Request, Response } from "express";
import { PokemonTypes } from "../entity/PokemonTypes";
import { pokemonTypesService } from "../service/PokemonTypesService";

export class PokemonTypesController {
  private pokemonTypesRepository = AppDataSource.getRepository(PokemonTypes);

  async all(req: Request, res: Response, next: NextFunction) {
    return pokemonTypesService.getAllPokemonTypes();
  }

  async one(req: Request, res: Response, next: NextFunction) {
    const id = parseInt(req.params.id);
    return await pokemonTypesService.getPokemonTypeById(id);
  }

  async save(req: Request, res: Response, next: NextFunction) {
    return await pokemonTypesService.savePokemonType(req.body);
  }

  async saveAll(req: Request, res: Response, next: NextFunction) {
    const pokemonTypeList = req.body;
    return await pokemonTypesService.saveAllPokemonTypes(pokemonTypeList);
  }

  async remove(req: Request, res: Response, next: NextFunction) {
    const id = parseInt(req.params.id);
    return await pokemonTypesService.removePokemonType(id);
  }
}
