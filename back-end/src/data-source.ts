import "reflect-metadata"
import { DataSource } from "typeorm"
import { Pokemon } from "./entity/Pokemon"
import { Box } from "./entity/Box"
import { Team } from "./entity/Team"
import { PokemonTypes } from "./entity/PokemonTypes"
//import { PokemonInTeam } from "./entity/PokemonInTeam"
//import { PokemonInBox } from "./entity/PokemonInBox"
import { TrainerPokemon } from "./entity/TrainerPokemon"
import { User } from "./entity/User"

export const AppDataSource = new DataSource({
    type: "postgres",
    host: "localhost",
    port: 5432,
    username: "postgres",
    password: "postgres",
    database: "pokemon-teams-database",
    synchronize: true,
    logging: false,
    entities: [User, Pokemon, Box, Team, PokemonTypes, TrainerPokemon, /*PokemonInBox, PokemonInTeam*/],
    migrations: [],
    migrationsTableName: "migrations",
    subscribers: [],
})
