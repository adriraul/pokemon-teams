import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Pokemon } from "./Pokemon";
import { GameLevel } from "./GameLevel";
import { LeagueLevel } from "./LeagueLevel";

@Entity()
export class GameLevelPokemons {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Pokemon, {
    onDelete: "CASCADE",
  })
  pokemon: Pokemon;

  @ManyToOne(() => GameLevel, {
    onDelete: "CASCADE",
  })
  gameLevel: GameLevel;

  @ManyToOne(() => LeagueLevel, {
    onDelete: "CASCADE",
  })
  leagueLevel: LeagueLevel;

  @Column({ type: "int" })
  order: number;

  @Column({ type: "boolean", default: false })
  dead: boolean;

  @Column({ type: "int", nullable: false, default: 0 })
  ps: number;

  @Column({ nullable: true })
  ivPS: number;

  @Column({ nullable: true })
  ivAttack: number;

  @Column({ nullable: true })
  ivDefense: number;
}
