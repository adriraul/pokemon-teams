import { Entity, Column, ManyToOne, PrimaryGeneratedColumn } from "typeorm"
import { Pokemon } from "./Pokemon"
import { Box } from "./Box"

@Entity()
export class PokemonInBox {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    pokemonId: number

    @Column()
    boxId: number

    @Column()
    level: number

    @ManyToOne(() => Pokemon, (pokemon) => pokemon.pokemonInBoxes, { onDelete: 'CASCADE' })
    pokemon: Pokemon

    @ManyToOne(() => Box, (box) => box.pokemonsInBox, { onDelete: 'CASCADE' })
    box: Box
}