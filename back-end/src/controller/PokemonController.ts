import { NextFunction, Request, Response } from "express"
import { pokemonService } from '../service/PokemonService';

export class PokemonController {


    async all(request: Request, response: Response, next: NextFunction) {
        const allPokemons = await pokemonService.getAllPokemons();
        return allPokemons;
    }

    async one(request: Request, response: Response, next: NextFunction) {
        const id = parseInt(request.params.id)
        const pokemon = await pokemonService.getPokemonById( id )

        if (!pokemon) {
            return "unregistered pokemon"
        }
        return pokemon
    }

    async saveAll(request: Request, response: Response, next: NextFunction) {
        const pokemonList = request.body; 
        return await pokemonService.saveAllPokemons(pokemonList);
    }

    async save(request: Request, response: Response, next: NextFunction) {
        const savedPokemon = await pokemonService.savePokemon(request.body);
        return savedPokemon;
    }

    async remove(request: Request, response: Response, next: NextFunction) {
        const id = parseInt(request.params.id)
        return await pokemonService.removePokemon(id);
    }

} 	