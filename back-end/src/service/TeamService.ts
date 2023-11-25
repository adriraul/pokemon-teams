import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Team } from "../entity/Team";
import { userService } from "./UserService";
import { TrainerPokemon } from "../entity/TrainerPokemon";

export class TeamService {
  private teamRepository = AppDataSource.getRepository(Team);

  async getAllTeams() {
    return this.teamRepository.find({
      relations: {
        trainerPokemons: true,
      },
    });
  }

  async getTeamById(id: number) {
    const team = await this.teamRepository.findOne({
      where: { id },
      relations: {
        trainerPokemons: true,
      },
    });
    return team;
  }

  async saveTeam(teamData: any) {
    const { name, user } = teamData;

    const team = new Team();
    team.name = name;
    team.user = user;

    return await this.teamRepository.save(team);
  }

  async addPokemonToTeam(req: Request, res: Response) {
    const trainerPokemonId = parseInt(req.query.trainerPokemonId);
    const teamId = parseInt(req.query.teamId);
    const userId = parseInt(req.user.userId);

    const team = await this.getTeamById(teamId);

    if (!team) {
      return "Bad Request. The team, the user or the pokemon doesn't exist.";
    }

    if (team.trainerPokemons.length == 6) {
      return "Bad Request. The team has already 6 pokemon.";
    }

    const user = await userService.getUserById(userId);

    const trainerPokemons = user.trainerPokemons;
    const trainerPokemonToAdd = trainerPokemons.find(
      (pokemon) => pokemon.id === trainerPokemonId
    );

    if (!trainerPokemonToAdd) {
      return "Bad Request. The pokemon doesn't exist on any trainer boxes.";
    }

    if (trainerPokemonToAdd.team) {
      return "Bad Request. The pokemon already has a team.";
    }

    trainerPokemonToAdd.boxId = null;
    trainerPokemonToAdd.teamId = team.id;
    await this.teamRepository.manager.save(TrainerPokemon, trainerPokemonToAdd);

    return this.getTeamById(team.id);
  }

  async removePokemonFromTeam(req: Request, res: Response) {
    const trainerPokemonId = parseInt(req.query.trainerPokemonId);
    const teamId = parseInt(req.query.teamId);
    const userId = parseInt(req.user.userId.userId);

    const team = await this.getTeamById(teamId);

    if (!team) {
      return "Bad Request. The team, the user or the pokemon doesn't exist.";
    }

    const user = await userService.getUserById(userId);

    const trainerPokemons = user.trainerPokemons;
    const trainerPokemonToAdd = trainerPokemons.find(
      (pokemon) => pokemon.id === trainerPokemonId
    );

    if (!trainerPokemonToAdd) {
      return "Bad Request. The pokemon doesn't exist on any trainer teams.";
    }

    if (trainerPokemonToAdd.teamId !== teamId) {
      return "Bad Request. The pokemon is not from this team.";
    }

    const freeBox = user.boxes.find((box) => box.trainerPokemons.length < 30);

    if (freeBox) {
      trainerPokemonToAdd.boxId = freeBox.id;
      trainerPokemonToAdd.teamId = null;
      await this.teamRepository.manager.save(
        TrainerPokemon,
        trainerPokemonToAdd
      );
    } else {
      return "All boxes are full, you have to switch it with other pokemon.";
    }

    return this.getTeamById(team.id);
  }

  async removeTeam(id: number) {
    const teamToRemove = await this.teamRepository.findOne({ where: { id } });
    if (!teamToRemove) {
      return "This Team does not exist";
    }

    await this.teamRepository.remove(teamToRemove);
    return "Team has been removed";
  }
}

const teamService = new TeamService();

export { teamService };
