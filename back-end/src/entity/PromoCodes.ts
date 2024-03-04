import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class PromoCodes {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", length: 12 })
  code: string;

  @Column({ type: "date" })
  expirationDate: Date;

  @Column({ type: "int" })
  amount: number;
}
