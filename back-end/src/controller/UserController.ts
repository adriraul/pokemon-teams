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

  async pokedex(req: Request, res: Response, next: NextFunction) {
    return await userService.getPokedex(req, res);
  }

  async allTeams(req: Request, res: Response, next: NextFunction) {
    return await userService.getAllTeamsByUser(req, res);
  }

  async allBoxes(req: Request, res: Response, next: NextFunction) {
    return await userService.getAllBoxesByUser(req, res);
  }

  async allGameLevels(req: Request, res: Response, next: NextFunction) {
    return await userService.getAllGameLevelsByUser(req, res);
  }

  async addPokemonToUser(req: Request, res: Response, next: NextFunction) {
    return await userService.addPokemonToUser(req, res);
  }

  async assignPokemonToFirstTeam(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    return await userService.assignPokemonToFirstTeam(req, res);
  }

  async sendPokemonToFirstBox(req: Request, res: Response, next: NextFunction) {
    return await userService.sendPokemonToFirstBox(req, res);
  }

  async switchBoxForTeamPokemon(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    return await userService.switchBoxForTeamPokemon(req, res);
  }

  async openPokeball(req: Request, res: Response, next: NextFunction) {
    return await userService.openPokeball(req, res);
  }

  async redeemCode(req: Request, res: Response, next: NextFunction) {
    return await userService.redeemCode(req, res);
  }

  async removePokemonFromUser(req: Request, res: Response, next: NextFunction) {
    return await userService.removePokemonFromUser(req, res);
  }
}
