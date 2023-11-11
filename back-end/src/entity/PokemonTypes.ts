import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable } from 'typeorm';
import { Pokemon } from './Pokemon';
import { Exclude } from 'class-transformer'

@Entity()
export class PokemonTypes {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 10 })
  name: string;

  /*@ManyToMany(() => Pokemon, (pokemon) => pokemon.pokemonTypes)
  @JoinTable({name: "pokemon_pokemon_types"})
  @Exclude({ toPlainOnly: true })
  pokemons: Pokemon[];*/
}
