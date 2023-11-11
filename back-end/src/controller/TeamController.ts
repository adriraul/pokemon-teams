import { AppDataSource } from "../data-source"
import { NextFunction, Request, Response } from "express"
import { Team } from "../entity/Team"
import { teamService } from "../service/TeamService"

export class TeamController {

    private teamRepository = AppDataSource.getRepository(Team)

    async all(request: Request, response: Response, next: NextFunction) {
        return await teamService.getAllTeams();
    }

    async one(request: Request, response: Response, next: NextFunction) {
        const id = parseInt(request.params.id);
        const team = await teamService.getTeamById(id);

        if (!team) {
            return "unregistered team";
        }
        return team
    }

    async save(request: Request, response: Response, next: NextFunction) {
        return await teamService.saveTeam(request.body);
    }

    async addPokemonToTeam(request: Request, response: Response, next: NextFunction) {
        return await teamService.addPokemonToTeam(request.query);
    }

    async removePokemonFromTeam(request: Request, response: Response, next: NextFunction) {
        return await teamService.removePokemonFromTeam(request.query);
    }

    async remove(request: Request, response: Response, next: NextFunction) {
        const id = parseInt(request.params.id)
        return await teamService.removeTeam(id);
    }

} 	