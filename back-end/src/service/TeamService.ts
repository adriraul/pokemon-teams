import { request } from "http";
import { AppDataSource } from "../data-source"
import { Box } from '../entity/Box';
import { Team } from '../entity/Team';
import { pokemonService } from "./PokemonService";

export class TeamService {
    private teamRepository = AppDataSource.getRepository(Team)

  async getAllTeams() {
    return this.teamRepository.find(
        { relations: {
        pokemons: true,
      },
    });
  }

  async getTeamById(id: number) {
    const team = await this.teamRepository.findOne({ 
        where: { id }, 
        relations: {
          pokemons: true,
        }, 
      });
    return team;
  }

  async saveTeam(teamData: any) {
    const { name, pokemons } = teamData;
      
    const team = new Team();
    team.name = name;
  
    const savedTeam = await this.teamRepository.save(team);

    const pokemonList = [];
    for (const pokemon of pokemons) {
      const storedPokemon = await pokemonService.findByPokedexId(pokemon.pokedex_id);
      if (storedPokemon) {
        pokemonList.push(storedPokemon);
      }
    }

    savedTeam.pokemons = pokemonList;
    
    await this.teamRepository.save(savedTeam);
  
    return savedTeam;
  }

  async addPokemonToTeam(requestQuery: any) {
    const pokemonPokedexId = parseInt(requestQuery.pokedexId);
    const teamId = parseInt(requestQuery.teamId);
      
    const team = await this.getTeamById(teamId);
    const pokemonToAdd = await pokemonService.findByPokedexId(pokemonPokedexId);

    if(!team || !pokemonToAdd) {
        return "Bad Request";
    }

    const teamPokemonList = team.pokemons;
    const existingPokemon = teamPokemonList.find((pokemon) => pokemon.id === pokemonToAdd.id);
    if(existingPokemon) {
        return "This pokemon already exist in the team";
    }
    teamPokemonList.push(pokemonToAdd);
    team.pokemons = teamPokemonList;
    const updatedTeam = await this.teamRepository.save(team);
  
    return updatedTeam;
  }

  async removePokemonFromTeam(requestQuery: any) {
    const pokemonPokedexId = parseInt(requestQuery.pokedexId);
    const teamId = parseInt(requestQuery.teamId);
      
    const team = await this.getTeamById(teamId);

    const pokemonToRemove = team.pokemons.find((pokemon) => pokemon.pokedex_id === pokemonPokedexId);

    if(!pokemonToRemove) {
      return "This pokemon does't exists in the team.";
    }

    const indexToRemove = team.pokemons.indexOf(pokemonToRemove);
    const teamPokemonList = team.pokemons;
    if (indexToRemove !== -1) {
      teamPokemonList.splice(indexToRemove, 1);
    }
    
    team.pokemons = teamPokemonList;
    
    const updatedTeam = await this.teamRepository.save(team);
  
    return updatedTeam;
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
