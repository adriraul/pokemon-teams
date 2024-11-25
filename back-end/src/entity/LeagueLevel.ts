import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from "typeorm";
import { User } from "./User";
import { GameLevelPokemons } from "./GameLevelPokemons";

@Entity()
export class LeagueLevel {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, {
    onDelete: "CASCADE",
  })
  user: User;

  @Column({ type: "varchar", length: 40 })
  leaderName: string;

  @Column({ type: "boolean", default: false })
  passed: boolean;

  @Column({ type: "boolean", default: false })
  blocked: boolean;

  @Column({ type: "boolean", default: false })
  active: boolean;

  @Column({ type: "int" })
  number: number;

  @Column({ type: "int", nullable: false, default: 0 })
  reward: number;

  @Column({ type: "int", nullable: true })
  badgeWonId: number;

  @OneToMany(
    () => GameLevelPokemons,
    (gameLevelPokemon) => gameLevelPokemon.leagueLevel
  )
  gameLevelPokemons: GameLevelPokemons[];
}
