import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { User } from "./User";

@Entity()
export class LevelTimeTracking {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, {
    onDelete: "CASCADE",
  })
  user: User;

  @Column({ type: "int" })
  levelNumber: number;

  @Column({ type: "varchar", length: 20, default: "game" })
  levelType: string; // "game" o "league"

  @Column({ type: "timestamp" })
  startTime: Date;

  @Column({ type: "timestamp", nullable: true })
  completionTime: Date;

  @Column({ type: "int", nullable: true })
  timeSpentSeconds: number;

  @Column({ type: "boolean", default: false })
  completed: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
