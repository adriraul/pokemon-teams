import { NextFunction, Request, Response } from "express";
import { userService } from "../service/UserService";

export class UserController {
  async register(req: Request, res: Response, next: NextFunction) {
    const savedUser = await userService.register(req, res);
    return savedUser;
  }

  async login(req: Request, res: Response) {
    return await userService.login(req, res);
  }

  async all(req: Request, res: Response, next: NextFunction) {
    const allUsers = await userService.getAllUsers();
    return allUsers;
  }

  async one(req: Request, res: Response, next: NextFunction) {
    const id = parseInt(req.params.id);
    const user = await userService.getUserById(id);

    if (!user) {
      res.status(404).json("User not found!");
    }
    return user;
  }

  async remove(req: Request, res: Response, next: NextFunction) {
    return await userService.removeUser(req, res);
  }

  async allPokemons(req: Request, res: Response, next: NextFunction) {
    return await userService.getAllPokemonsByUser(req, res);
  }

  async allTeams(req: Request, res: Response, next: NextFunction) {
    return await userService.getAllTeamsByUser(req, res);
  }

  async allBoxes(req: Request, res: Response, next: NextFunction) {
    return await userService.getAllBoxesByUser(req, res);
  }

  async addPokemonToUser(req: Request, res: Response, next: NextFunction) {
    return await userService.addPokemonToUser(req, res);
  }

  async removePokemonFromUser(req: Request, res: Response, next: NextFunction) {
    return await userService.removePokemonFromUser(req, res);
  }
}
