import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { PokemonTypes } from "./PokemonTypes";

@Entity()
export class TypeInteraction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "decimal", precision: 4, scale: 3 })
  multiplier: number;

  @ManyToOne(() => PokemonTypes, { eager: true })
  @JoinColumn({ name: "attack_type_id" })
  attackType: PokemonTypes;

  @ManyToOne(() => PokemonTypes, { eager: true })
  @JoinColumn({ name: "defense_type_id" })
  defenseType: PokemonTypes;
}
