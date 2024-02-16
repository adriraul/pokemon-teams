import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
} from "typeorm";
import { TrainerPokemon } from "./TrainerPokemon";
import { User } from "./User";

@Entity()
export class Box {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", length: 25 })
  name: string;

  @Column({ type: "int", width: 3 })
  space_limit: number;

  @OneToMany(() => TrainerPokemon, (trainerPokemon) => trainerPokemon.box)
  trainerPokemons: TrainerPokemon[];

  @ManyToOne(() => User, (user) => user.boxes)
  user: User;

  findFreeGap(): number {
    const sortedPokemons = this.trainerPokemons
      .slice()
      .sort((a, b) => a.orderInBox - b.orderInBox);

    let nextGap = 1;

    for (const pokemon of sortedPokemons) {
      if (pokemon.orderInBox === nextGap) {
        nextGap++;
      } else {
        return nextGap;
      }
    }

    return nextGap;
  }
}
