import { Entity, Column, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Pokemon } from "./Pokemon";
import { User } from "./User";

@Entity()
export class TrainerPokedex {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  pokemonId: number;

  @Column()
  userId: number;

  @ManyToOne(() => Pokemon, (pokemon) => pokemon.trainersPokemon, {
    onDelete: "CASCADE",
  })
  pokemon: Pokemon;

  @ManyToOne(() => User, (user) => user.trainerPokemons, {
    onDelete: "CASCADE",
  })
  user: User;
}
