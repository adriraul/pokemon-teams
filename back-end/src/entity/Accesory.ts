import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class Accessory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  code: string;

  @Column()
  name: string;

  @Column()
  description: string;
}
