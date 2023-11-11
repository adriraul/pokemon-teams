import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany, JoinTable } from 'typeorm';
import { Pokemon } from './Pokemon';
//import { PokemonInTeam } from './PokemonInTeam';

@Entity()
export class Team {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 25 })
  name: string;

  @ManyToMany(() => Pokemon, { onDelete: 'CASCADE' })
  @JoinTable()
  pokemons: Pokemon[];

  /*@OneToMany(() => PokemonInTeam, pokemonInTeam => pokemonInTeam.team)
  pokemonsInTeam: PokemonInTeam[];*/
}
