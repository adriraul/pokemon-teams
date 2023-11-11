import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable, OneToMany } from 'typeorm';
import { PokemonTypes } from './PokemonTypes';
//import { PokemonInTeam } from './PokemonInTeam'
import { PokemonInBox } from './PokemonInBox'

@Entity()
export class Pokemon {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', unique: true, nullable: false })
  pokedex_id: number;

  @Column({ type: 'varchar', length: 20 })
  name: string;

  @Column({ type: 'varchar', length: 255 })
  photo: string;

  @ManyToMany(() => PokemonTypes, { onDelete: 'CASCADE' })
  @JoinTable()
  pokemonTypes: PokemonTypes[];

  /*@OneToMany(() => PokemonInTeam, pokemonInTeam => pokemonInTeam.pokemon)
  pokemonInTeams: PokemonInTeam[];*/
  
  @OneToMany(() => PokemonInBox, pokemonInBox => pokemonInBox.pokemon)
  pokemonInBoxes: PokemonInBox[];

  /*@ManyToMany(() => Box, (box) => box.pokemons, { onDelete: 'CASCADE' })
  @JoinTable({name: "pokemon_box"})
  @Exclude()
  boxes: Box[];*/

  /*@ManyToMany(() => Team, (team) => team.pokemons, { onDelete: 'CASCADE' })
  @JoinTable({name: "pokemon_team"})
  @Exclude()
  teams: Team[];*/
}
