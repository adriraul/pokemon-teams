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
export class Team {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", length: 25 })
  name: string;

  @OneToMany(() => TrainerPokemon, (trainerPokemon) => trainerPokemon.team)
  trainerPokemons: TrainerPokemon[];

  @ManyToOne(() => User, (user) => user.teams)
  user: User;

  findFreeGap(): number {
    const sortedPokemons = this.trainerPokemons
      .slice()
      .sort((a, b) => a.orderInBox - b.orderInBox);

    let nextGap = 1;

    for (const pokemon of sortedPokemons) {
      if (pokemon.orderInTeam === nextGap) {
        nextGap++;
      } else {
        return nextGap;
      }
    }

    return nextGap;
  }
}
