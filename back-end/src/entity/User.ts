import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { TrainerPokemon } from "./TrainerPokemon";
import { Box } from "./Box";
import { Team } from "./Team";

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", length: 50, unique: true, nullable: false })
  username: string;

  @Column({ type: "varchar", length: 255, nullable: false })
  password: string;

  @Column({ type: "varchar", length: 100, nullable: false })
  email: string;

  @Column({ type: "int", default: 0 })
  balance: number;

  @OneToMany(() => TrainerPokemon, (trainerPokemon) => trainerPokemon.user)
  trainerPokemons: TrainerPokemon[];

  @OneToMany(() => Box, (box) => box.user)
  boxes: Box[];

  @OneToMany(() => Team, (team) => team.user)
  teams: Team[];
}
