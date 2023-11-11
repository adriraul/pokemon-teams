/*import { Entity, Column, ManyToOne, PrimaryGeneratedColumn } from "typeorm"
import { Pokemon } from "./Pokemon"
import { Team } from "./Team"

@Entity()
export class PokemonInTeam {
    @PrimaryGeneratedColumn()
    pokemonInTeam: number

    @Column()
    pokemonId: number

    @Column()
    teamId: number

    @Column()
    level: number

    @ManyToOne(() => Pokemon, (pokemon) => pokemon.pokemonInTeams)
    pokemon: Pokemon

    @ManyToOne(() => Team, (team) => team.pokemonsInTeam)
    team: Team
}*/