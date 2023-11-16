import { AppDataSource } from "../data-source"
import { NextFunction, Request, Response } from "express"
import { Box } from "../entity/Box"
import { pokemonService } from "../service/PokemonService"
import { boxService } from "../service/BoxService"

export class BoxController {

    async all(request: Request, response: Response, next: NextFunction) {
        return boxService.getAllBoxes();
    }

    async one(request: Request, response: Response, next: NextFunction) {
        const id = parseInt(request.params.id);
        const box = await boxService.getBoxById(id);

        if (!box) {
            return "unregistered box"
        }
        return box
    }

    async save(request: Request, response: Response, next: NextFunction) {
        const savedBox = await boxService.saveBox(request.body);
        return savedBox;
    }

    async addPokemonToBox(request: Request, response: Response, next: NextFunction) {
        return await boxService.addPokemonToBox(request.query);
    }

    async remove(request: Request, response: Response, next: NextFunction) {
        const id = parseInt(request.params.id)
        return await boxService.removeBox(id);
    }

} 	