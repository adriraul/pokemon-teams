import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany, JoinTable } from 'typeorm';
import { Pokemon } from './Pokemon';
import { PokemonInBox } from './PokemonInBox';

@Entity()
export class Box {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 25 })
  name: string;

  @Column({ type: 'int', width: 3 })
  space_limit: number;

  /*@ManyToMany(() => Pokemon, { onDelete: 'CASCADE' })
  @JoinTable()
  pokemons: Pokemon[];*/

  @OneToMany(() => PokemonInBox, pokemonInBox => pokemonInBox.box)
  pokemonsInBox: PokemonInBox[];
}
