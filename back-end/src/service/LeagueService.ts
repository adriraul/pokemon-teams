import { AppDataSource } from "../data-source";
import { LeagueTeam } from "../entity/LeagueTeam";
import { TrainerPokemon } from "../entity/TrainerPokemon";
import { User } from "../entity/User";
import { Request, Response } from "express";

export class LeagueService {
  private leagueTeamRepository = AppDataSource.getRepository(LeagueTeam);
  private trainerPokemonRepository =
    AppDataSource.getRepository(TrainerPokemon);
  private userRepository = AppDataSource.getRepository(User);

  async getLeagueTeamByUser(userId: number) {
    return await this.leagueTeamRepository.findOne({
      where: { user: { id: userId } },
      relations: [
        "trainerPokemons",
        "trainerPokemons.pokemon",
        "trainerPokemons.pokemon.pokemonTypes",
        "trainerPokemons.movements",
        "trainerPokemons.movements.pokemonType",
      ],
    });
  }

  async createLeagueTeam(req: Request, res: Response) {
    const userId = parseInt(req.user.userId);
    const trainerPokemonIds: number[] = req.body.trainerPokemonIds;
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const trainerPokemons = await Promise.all(
      trainerPokemonIds.map((id) =>
        this.trainerPokemonRepository.findOne({
          where: { id },
          relations: ["pokemon"],
        })
      )
    );

    if (trainerPokemons.length !== 3 || trainerPokemons.includes(null)) {
      res
        .status(404)
        .json({ error: "You must select exactly 3 valid Pokémon" });
      return;
    }

    const pokedexIds = trainerPokemons.map((tp) => tp.pokemon.pokedex_id);
    const uniquePokedexIds = new Set(pokedexIds);

    if (uniquePokedexIds.size !== pokedexIds.length) {
      res.status(400).json({ error: "You cannot select duplicate Pokémon" });
      return;
    }

    for (let i = 0; i < trainerPokemons.length; i++) {
      const trainerPokemon = trainerPokemons[i];
      trainerPokemon.leagueOrder = i + 1;
      await this.trainerPokemonRepository.save(trainerPokemon);
    }

    const leagueTeam = new LeagueTeam();
    leagueTeam.user = user;
    leagueTeam.trainerPokemons = trainerPokemons as TrainerPokemon[];

    leagueTeam.trainerPokemons = trainerPokemons;
    await this.leagueTeamRepository.save(leagueTeam);

    res.status(200).json("");
    return;
  }

  async deleteLeagueTeam(userId: number) {
    const leagueTeam = await this.getLeagueTeamByUser(userId);
    if (leagueTeam) {
      await this.leagueTeamRepository.remove(leagueTeam);
    }
  }
}

const leagueService = new LeagueService();
export { leagueService };
