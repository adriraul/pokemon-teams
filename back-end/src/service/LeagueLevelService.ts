import { AppDataSource } from "../data-source";
import { User } from "../entity/User";
import { LeagueLevel } from "../entity/LeagueLevel";
import { GameLevelPokemons } from "../entity/GameLevelPokemons";
import { pokemonService } from "./PokemonService";
import { BadgesEnum } from "../constants/badges";

export class LeagueLevelService {
  private leagueLevelRepository = AppDataSource.getRepository(LeagueLevel);
  private gameLevelPokemonRepository =
    AppDataSource.getRepository(GameLevelPokemons);

  private teams = [
    { leaderName: "Bug Master", pokedexIds: [212, 214, 469] }, // Scizor, Heracross, Yanmega
    { leaderName: "Ground Conqueror", pokedexIds: [445, 472, 473] }, // Garchomp, Gliscor, Mamoswine
    { leaderName: "Fire Specialist", pokedexIds: [392, 467, 229] }, // Infernape, Magmortar, Houndoom
    { leaderName: "Psychic Genius", pokedexIds: [376, 475, 65] }, // Metagross, Gallade, Alakazam
    { leaderName: "Ultimate Champion", pokedexIds: [442, 468, 483] }, // Spiritomb, Togekiss, Dialga
  ];

  async createLeagueForUser(user: User) {
    for (let i = 0; i < this.teams.length; i++) {
      const team = this.teams[i];
      const leagueLevel = new LeagueLevel();

      leagueLevel.user = user;
      leagueLevel.leaderName = team.leaderName;
      leagueLevel.passed = false;
      leagueLevel.blocked = i === this.teams.length - 1 ? true : false;
      leagueLevel.active = false;
      leagueLevel.number = i + 1;
      leagueLevel.reward = 300;
      leagueLevel.badgeWonId =
        i === this.teams.length - 1 ? BadgesEnum.EMERALD : null;

      const savedLeagueLevel = await this.leagueLevelRepository.save(
        leagueLevel
      );

      for (const [index, pokedexId] of team.pokedexIds.entries()) {
        const pokemon = await pokemonService.findByPokedexId(pokedexId);
        if (!pokemon) {
          console.error(`Pokemon with Pokedex ID ${pokedexId} not found.`);
          continue;
        }

        const gameLevelPokemon = new GameLevelPokemons();
        gameLevelPokemon.leagueLevel = savedLeagueLevel;
        gameLevelPokemon.pokemon = pokemon;
        gameLevelPokemon.order = index + 1;

        gameLevelPokemon.ivPS = 31;
        gameLevelPokemon.ivAttack = 31;
        gameLevelPokemon.ivDefense = 31;
        gameLevelPokemon.ps = pokemon.ps + 31 * 2;

        await this.gameLevelPokemonRepository.save(gameLevelPokemon);
      }
    }
  }

  async getLeagueLevelsByUser(userId: number) {
    try {
      const leagueLevels = await this.leagueLevelRepository.find({
        where: { user: { id: userId } },
        relations: [
          "gameLevelPokemons",
          "gameLevelPokemons.pokemon",
          "gameLevelPokemons.pokemon.pokemonTypes",
        ],
        order: { number: "ASC" }, // Ordena los niveles de la liga por su número
      });

      return leagueLevels;
    } catch (error) {
      console.error("Error fetching league levels for user:", error);
      throw new Error("Failed to fetch league levels.");
    }
  }

  async getLeagueLevelByUser(userId: number, levelId: number) {
    try {
      const leagueLevel = await this.leagueLevelRepository.findOne({
        where: { user: { id: userId }, id: levelId },
        relations: [
          "gameLevelPokemons",
          "gameLevelPokemons.pokemon",
          "gameLevelPokemons.pokemon.pokemonTypes",
        ],
        order: { number: "ASC" }, // Ordena los niveles de la liga por su número
      });

      return leagueLevel;
    } catch (error) {
      console.error("Error fetching league levels for user:", error);
      throw new Error("Failed to fetch league levels.");
    }
  }
}

const leagueLevelService = new LeagueLevelService();

export { leagueLevelService };
