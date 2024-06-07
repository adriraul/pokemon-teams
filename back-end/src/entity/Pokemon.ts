import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
  OneToMany,
} from "typeorm";
import { PokemonTypes } from "./PokemonTypes";
import { TrainerPokemon } from "./TrainerPokemon";

@Entity()
export class Pokemon {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "int", unique: true, nullable: false })
  pokedex_id: number;

  @Column({ type: "varchar", length: 20 })
  name: string;

  @Column({ type: "varchar", length: 255 })
  photo: string;

  @Column({ type: "int", nullable: false, default: 0 })
  power: number;

  @Column({ type: "int", nullable: false, default: 0 })
  ps: number;

  @ManyToMany(() => PokemonTypes, { onDelete: "CASCADE" })
  @JoinTable()
  pokemonTypes: PokemonTypes[];

  @OneToMany(() => TrainerPokemon, (trainerPokemon) => trainerPokemon.pokemon)
  trainersPokemon: TrainerPokemon[];
}
