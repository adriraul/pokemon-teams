import { request } from "http";
import { AppDataSource } from "../data-source"
import { Box } from '../entity/Box';
import { Team } from '../entity/Team';
import { pokemonService } from "./PokemonService";
import { userService } from "./UserService";
import { TrainerPokemon } from "../entity/TrainerPokemon";

export class TeamService {
    private teamRepository = AppDataSource.getRepository(Team)

  async getAllTeams() {
    return this.teamRepository.find(
        { relations: {
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

  async addPokemonToTeam(requestQuery: any) {
    const trainerPokemonId = parseInt(requestQuery.trainerPokemonId);
    const teamId = parseInt(requestQuery.teamId);
    const userId = parseInt(requestQuery.userId);
      
    const team = await this.getTeamById(teamId);
    const user = await userService.getUserById(userId);

    if(!team || !user) {
        return "Bad Request. The team, the user or the pokemon doesn't exist.";
    }

    const trainerPokemons = user.trainerPokemons;
    const trainerPokemonToAdd = trainerPokemons.find((pokemon) => pokemon.id === trainerPokemonId);

    console.log(trainerPokemons);
    if(!trainerPokemonToAdd) {
      return "Bad Request. The pokemon doesn't exist on any trainer boxes."
    }

    if(trainerPokemonToAdd.team) {
      return "Bad Request. The pokemon already has a team."
    }

    trainerPokemonToAdd.boxId = null;
    trainerPokemonToAdd.teamId = team.id;
    await this.teamRepository.manager.save(TrainerPokemon, trainerPokemonToAdd);
  
    return this.getTeamById(team.id);
  }

  async removePokemonFromTeam(requestQuery: any) {
    const trainerPokemonId = parseInt(requestQuery.trainerPokemonId);
    const teamId = parseInt(requestQuery.teamId);
    const userId = parseInt(requestQuery.userId);

    const team = await this.getTeamById(teamId);
    const user = await userService.getUserById(userId);

    if(!team || !user) {
        return "Bad Request. The team, the user or the pokemon doesn't exist.";
    }

    const trainerPokemons = user.trainerPokemons;
    const trainerPokemonToAdd = trainerPokemons.find((pokemon) => pokemon.id === trainerPokemonId);

    if(!trainerPokemonToAdd) {
      return "Bad Request. The pokemon doesn't exist on any trainer teams."
    }

    if(trainerPokemonToAdd.teamId !== teamId) {
      return "Bad Request. The pokemon is not from this team."
    }

    trainerPokemonToAdd.boxId = user.boxes[0].id;
    trainerPokemonToAdd.teamId = null;
    await this.teamRepository.manager.save(TrainerPokemon, trainerPokemonToAdd);
  
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

export {
  teamService,
};
