import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToMany,
} from "typeorm";
import { Movement } from "./Movement";
import { Pokemon } from "./Pokemon";

@Entity()
export class PokemonTypes {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", length: 10 })
  name: string;

  @ManyToMany(() => Pokemon, (pokemon) => pokemon.pokemonTypes)
  pokemons: Pokemon[];

  @OneToMany(() => Movement, (movement) => movement.pokemonType)
  movements: Movement[];
}
