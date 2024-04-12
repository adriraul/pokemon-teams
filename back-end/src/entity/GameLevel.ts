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
export class GameLevel {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, {
    onDelete: "CASCADE",
  })
  user: User;

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

  @OneToMany(
    () => GameLevelPokemons,
    (gameLevelPokemon) => gameLevelPokemon.gameLevel
  )
  gameLevelPokemons: GameLevelPokemons[];
}
