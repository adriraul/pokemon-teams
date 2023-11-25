import { NextFunction, Request, Response } from "express";
import { userService } from '../service/UserService';

export class UserController {

    async login(req: Request, res: Response) {
        return await userService.login(req, res);
      }

    async all(request: Request, response: Response, next: NextFunction) {
        const allUsers = await userService.getAllUsers();
        return allUsers;
    }

    async one(request: Request, response: Response, next: NextFunction) {
        const id = parseInt(request.params.id);
        const user = await userService.getUserById(id);

        if (!user) {
            return "User not found";
        }
        return user;
    }

    async save(request: Request, response: Response, next: NextFunction) {
        const savedUser = await userService.saveUser(request.body);
        return savedUser;
    }

    async addPokemonToUser(request: Request, response: Response, next: NextFunction) {
        return await userService.addPokemonToUser(request.query);
    }

    async removePokemonFromUser(request: Request, response: Response, next: NextFunction) {
        return await userService.removePokemonFromUser(request.query);
    }

    async remove(request: Request, response: Response, next: NextFunction) {
        const id = parseInt(request.params.id);
        return await userService.removeUser(id);
    }
}
