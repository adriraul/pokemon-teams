import { AppDataSource } from "../data-source";
import { User } from "../entity/User";
import { LeagueLevel } from "../entity/LeagueLevel";
import { GameLevelPokemons } from "../entity/GameLevelPokemons";
import { pokemonService } from "./PokemonService";
import { BadgesEnum } from "../constants/badges";
import { LevelTimeTrackingService } from "./LevelTimeTrackingService";

export class LeagueLevelService {
  private leagueLevelRepository = AppDataSource.getRepository(LeagueLevel);
  private gameLevelPokemonRepository =
    AppDataSource.getRepository(GameLevelPokemons);
  private levelTimeTrackingService = new LevelTimeTrackingService();

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
      leagueLevel.reward = i === this.teams.length - 1 ? 500000 : 300;
      leagueLevel.badgeWonId =
        i === this.teams.length - 1 ? BadgesEnum.EMERALD : null;

      const savedLeagueLevel = await this.leagueLevelRepository.save(
        leagueLevel
      );

      // Registrar el inicio del nivel de liga cuando se crea por primera vez
      try {
        await this.levelTimeTrackingService.startLevel(
          user.id,
          leagueLevel.number,
          "league"
        );
      } catch (error) {

      }

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
        const ivs = ["ivPS", "ivAttack", "ivDefense"];
        const shuffled = ivs.sort(() => 0.5 - Math.random());
        const maxIVs = shuffled.slice(0, 2);

        gameLevelPokemon.ivPS = maxIVs.includes("ivPS") ? 31 : 16;
        gameLevelPokemon.ivAttack = maxIVs.includes("ivAttack") ? 31 : 16;
        gameLevelPokemon.ivDefense = maxIVs.includes("ivDefense") ? 31 : 16;

        const effectivePower = pokemon.power < 10 ? 10 : pokemon.power;
        gameLevelPokemon.ps = 30 * effectivePower + gameLevelPokemon.ivPS * 2;

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
        order: { number: "ASC" },
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
        order: { number: "ASC" },
      });

      if (leagueLevel && leagueLevel.gameLevelPokemons) {
        leagueLevel.gameLevelPokemons.sort((a, b) => a.order - b.order);
      }

      return leagueLevel;
    } catch (error) {
      console.error("Error fetching league levels for user:", error);
      throw new Error("Failed to fetch league levels.");
    }
  }
}

const leagueLevelService = new LeagueLevelService();

export { leagueLevelService };
