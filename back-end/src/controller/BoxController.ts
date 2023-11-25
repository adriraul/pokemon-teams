import { NextFunction, Request, Response } from "express";
import { boxService } from "../service/BoxService";

export class BoxController {
  async all(req: Request, res: Response, next: NextFunction) {
    return boxService.getAllBoxes();
  }

  async one(req: Request, res: Response, next: NextFunction) {
    const id = parseInt(req.params.id);
    const box = await boxService.getBoxById(id);

    if (!box) {
      return "unregistered box";
    }
    return box;
  }

  async save(req: Request, res: Response, next: NextFunction) {
    const savedBox = await boxService.saveBox(req, res);
    return savedBox;
  }

  //This maybe will never be used
  async addPokemonToBox(req: Request, res: Response, next: NextFunction) {
    return await boxService.addPokemonToBox(req.query);
  }

  async remove(req: Request, res: Response, next: NextFunction) {
    const id = parseInt(req.params.id);
    return await boxService.removeBox(id);
  }
}
