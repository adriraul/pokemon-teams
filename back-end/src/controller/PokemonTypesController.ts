import { AppDataSource } from "../data-source";
import { NextFunction, Request, Response } from "express";
import { PokemonTypes } from "../entity/PokemonTypes";
import { pokemonTypesService } from "../service/PokemonTypesService";

export class PokemonTypesController {
  private pokemonTypesRepository = AppDataSource.getRepository(PokemonTypes);

  async all(request: Request, response: Response, next: NextFunction) {
    return pokemonTypesService.getAllPokemonTypes();
  }

  async one(request: Request, response: Response, next: NextFunction) {
    const id = parseInt(request.params.id);
    return await pokemonTypesService.getPokemonTypeById(id);
  }

  async save(request: Request, response: Response, next: NextFunction) {
    return await pokemonTypesService.savePokemonType(request.body);
  }

  async saveAll(request: Request, response: Response, next: NextFunction) {
    const pokemonTypeList = request.body;
    return await pokemonTypesService.saveAllPokemonTypes(pokemonTypeList);
  }

  async remove(request: Request, response: Response, next: NextFunction) {
    const id = parseInt(request.params.id);
    return await pokemonTypesService.removePokemonType(id);
  }
}
