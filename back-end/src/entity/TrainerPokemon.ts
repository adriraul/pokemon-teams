import { Entity, Column, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Pokemon } from "./Pokemon";
import { User } from "./User";
import { Box } from "./Box";
import { Team } from "./Team";

@Entity()
export class TrainerPokemon {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  pokemonId: number;

  @Column()
  userId: number;

  @Column({ nullable: true })
  boxId: number;

  @Column({ nullable: true })
  teamId: number;

  @Column()
  level: number;

  @Column({ nullable: true })
  orderInBox: number;

  @Column({ type: "varchar", length: 20, nullable: true })
  nickname: string;

  @ManyToOne(() => Pokemon, (pokemon) => pokemon.trainersPokemon, {
    onDelete: "CASCADE",
  })
  pokemon: Pokemon;

  @ManyToOne(() => User, (user) => user.trainerPokemons, {
    onDelete: "CASCADE",
  })
  user: User;

  @ManyToOne(() => Box, (box) => box.trainerPokemons, { nullable: true })
  box: Box;

  @ManyToOne(() => Team, (team) => team.trainerPokemons, { nullable: true })
  team: Team;
}
