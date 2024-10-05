import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from "typeorm";
import { User } from "./User";

@Entity()
export class UserStats {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: 0 })
  victories: number;

  @Column({ default: 0 })
  defeats: number;

  @Column({ default: 0 })
  pokeballsOpened: number;

  @Column({ default: 0 })
  superballsOpened: number;

  @Column({ default: 0 })
  ultraballsOpened: number;

  @Column({ default: 0 })
  moneySpent: number;

  @Column({ default: 0 })
  pokedex: number;

  @OneToOne(() => User)
  @JoinColumn()
  user: User;
}
