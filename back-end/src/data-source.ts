import "reflect-metadata"
import { DataSource } from "typeorm"
import { Pokemon } from "./entity/Pokemon"
import { Box } from "./entity/Box"
import { Team } from "./entity/Team"
import { PokemonTypes } from "./entity/PokemonTypes"
//import { PokemonInTeam } from "./entity/PokemonInTeam"
import { PokemonInBox } from "./entity/PokemonInBox"

export const AppDataSource = new DataSource({
    type: "postgres",
    host: "localhost",
    port: 5432,
    username: "postgres",
    password: "postgres",
    database: "pokemon-teams-database",
    synchronize: true,
    logging: false,
    entities: [Pokemon, Box, Team, PokemonTypes, PokemonInBox, /*PokemonInTeam*/],
    migrations: [],
    migrationsTableName: "migrations",
    subscribers: [],
})
