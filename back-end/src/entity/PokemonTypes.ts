import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class PokemonTypes {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", length: 10 })
  name: string;
}
