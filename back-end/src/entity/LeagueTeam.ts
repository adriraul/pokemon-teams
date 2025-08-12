import { Entity, PrimaryGeneratedColumn, OneToMany, ManyToOne } from "typeorm";
import { TrainerPokemon } from "./TrainerPokemon";
import { User } from "./User";

@Entity()
export class LeagueTeam {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToMany(
    () => TrainerPokemon,
    (trainerPokemon) => trainerPokemon.leagueTeam
  )
  trainerPokemons: TrainerPokemon[];

  @ManyToOne(() => User, (user) => user.teams)
  user: User;
}
