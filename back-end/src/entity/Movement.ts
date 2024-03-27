import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { TrainerPokemon } from "./TrainerPokemon";
import { PokemonTypes } from "./PokemonTypes";

@Entity()
export class Movement {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "int", width: 3 })
  quantity: number;

  @ManyToOne(
    () => TrainerPokemon,
    (trainerPokemon) => trainerPokemon.movements,
    {
      onDelete: "CASCADE",
    }
  )
  trainerPokemon: TrainerPokemon;

  @ManyToOne(() => PokemonTypes, (pokemonTypes) => pokemonTypes.movements, {
    onDelete: "CASCADE",
  })
  pokemonType: PokemonTypes;
}
