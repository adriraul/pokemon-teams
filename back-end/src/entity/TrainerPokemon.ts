import {
  Entity,
  Column,
  ManyToOne,
  PrimaryGeneratedColumn,
  OneToMany,
} from "typeorm";
import { Pokemon } from "./Pokemon";
import { User } from "./User";
import { Box } from "./Box";
import { Team } from "./Team";
import { Movement } from "./Movement";
import { LeagueTeam } from "./LeagueTeam";

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

  @Column({ nullable: true })
  orderInTeam: number;

  @Column({ nullable: true })
  ps: number;

  @Column({ default: false })
  activeInGameLevel: boolean;

  @Column({ type: "varchar", length: 20, nullable: true })
  nickname: string;

  @Column({ nullable: true })
  ivPS: number;

  @Column({ nullable: true })
  ivAttack: number;

  @Column({ nullable: true })
  ivDefense: number;

  @Column({ nullable: true })
  object: number;

  @Column({ nullable: true })
  leagueOrder: number;

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

  @ManyToOne(() => LeagueTeam, (leagueTeam) => leagueTeam.trainerPokemons, {
    nullable: true,
  })
  leagueTeam: LeagueTeam;

  @OneToMany(() => Movement, (movement) => movement.trainerPokemon)
  movements: Movement[];
}
