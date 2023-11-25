import { NextFunction, Request, Response } from "express";
import { userService } from "../service/UserService";

export class UserController {
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
      return "User not found";
    }
    return user;
  }

  async register(req: Request, res: Response, next: NextFunction) {
    const savedUser = await userService.register(req.body);
    return savedUser;
  }

  async addPokemonToUser(req: Request, res: Response, next: NextFunction) {
    return await userService.addPokemonToUser(req, res);
  }

  async removePokemonFromUser(req: Request, res: Response, next: NextFunction) {
    return await userService.removePokemonFromUser(req, res);
  }

  async remove(req: Request, res: Response, next: NextFunction) {
    const id = parseInt(req.params.id);
    return await userService.removeUser(id);
  }
}
