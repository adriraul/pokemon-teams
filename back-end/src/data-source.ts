import "reflect-metadata";
import { DataSource } from "typeorm";
import { Pokemon } from "./entity/Pokemon";
import { Box } from "./entity/Box";
import { Team } from "./entity/Team";
import { PokemonTypes } from "./entity/PokemonTypes";
import { TrainerPokemon } from "./entity/TrainerPokemon";
import { User } from "./entity/User";
import { PromoCodes } from "./entity/PromoCodes";
import { TrainerPokedex } from "./entity/TrainerPokedex";
import { Movement } from "./entity/Movement";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: "localhost",
  port: 5432,
  username: "postgres",
  password: "postgres",
  database: "pokemon-teams-database",
  synchronize: true,
  logging: false,
  entities: [
    User,
    Pokemon,
    Box,
    Team,
    PokemonTypes,
    TrainerPokemon,
    PromoCodes,
    TrainerPokedex,
    Movement,
  ],
  migrations: [],
  migrationsTableName: "migrations",
  subscribers: [],
});
