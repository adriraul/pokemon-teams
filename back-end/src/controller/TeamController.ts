import { NextFunction, Request, Response } from "express";
import { teamService } from "../service/TeamService";

export class TeamController {
  async all(req: Request, res: Response, next: NextFunction) {
    return await teamService.getAllTeams();
  }

  async one(req: Request, res: Response, next: NextFunction) {
    const id = parseInt(req.params.id);
    const team = await teamService.getTeamById(id);

    if (!team) {
      return "unregistered team";
    }
    return team;
  }

  async save(req: Request, res: Response, next: NextFunction) {
    return await teamService.saveTeam(req.body);
  }

  async addPokemonToTeam(req: Request, res: Response, next: NextFunction) {
    return await teamService.addPokemonToTeam(req, res);
  }

  async removePokemonFromTeam(req: Request, res: Response, next: NextFunction) {
    return await teamService.removePokemonFromTeam(req, res);
  }

  async remove(req: Request, res: Response, next: NextFunction) {
    const id = parseInt(req.params.id);
    return await teamService.removeTeam(id);
  }
}
