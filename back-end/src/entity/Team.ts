import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne } from 'typeorm';
import { TrainerPokemon } from './TrainerPokemon';
import { User } from './User';

@Entity()
export class Team {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 25 })
  name: string;

  @OneToMany(() => TrainerPokemon, trainerPokemon => trainerPokemon.team)
  trainerPokemons: TrainerPokemon[];

  @ManyToOne(() => User, user => user.teams)
  user: User

}
