import { NextFunction, Request, Response } from "express";
import { pokemonService } from "../service/PokemonService";

export class PokemonController {
  async all(req: Request, res: Response, next: NextFunction) {
    const allPokemons = await pokemonService.getAllPokemons();
    return allPokemons;
  }

  async one(req: Request, res: Response, next: NextFunction) {
    const id = parseInt(req.params.id);
    const pokemon = await pokemonService.getPokemonById(id);

    if (!pokemon) {
      return "unregistered pokemon";
    }
    return pokemon;
  }

  async saveAll(req: Request, res: Response, next: NextFunction) {
    const pokemonList = req.body;
    return await pokemonService.saveAllPokemons(pokemonList);
  }

  async save(req: Request, res: Response, next: NextFunction) {
    const savedPokemon = await pokemonService.savePokemon(req.body);
    return savedPokemon;
  }

  async remove(req: Request, res: Response, next: NextFunction) {
    const id = parseInt(req.params.id);
    return await pokemonService.removePokemon(id);
  }
}
