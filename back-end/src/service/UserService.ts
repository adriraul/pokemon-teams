import { AppDataSource } from "../data-source";
import { TrainerPokemon } from "../entity/TrainerPokemon";
import { User } from '../entity/User';
import { pokemonService } from "./PokemonService";

export class UserService {
    private userRepository = AppDataSource.getRepository(User);

    async getAllUsers() {
        return this.userRepository.find({
            relations: ['trainerPokemons', 'trainerPokemons.pokemon'],
        });
    }

    async getUserById(id: number) {
        return this.userRepository.findOne({ 
            where: { id }, 
            relations: ['trainerPokemons', 'trainerPokemons.pokemon', 'boxes'],
        });
    }

    async saveUser(userData: any) {
        const { username, password, email } = userData;
        const user = new User();
        user.username = username;
        user.password = password;
        user.email = email;

        const savedUser = await this.userRepository.save(user);
        return savedUser;
    }

    async addPokemonToUser(requestQuery: any) {
        const pokemonPokedexId = parseInt(requestQuery.pokedexId);
        const userId = parseInt(requestQuery.userId);
          
        const user = await userService.getUserById(userId);
        const pokemonToAdd = await pokemonService.findByPokedexId(pokemonPokedexId);
    
        if (!user || !pokemonToAdd) {
            return "Bad Request, the user or pokemon doesn't exist";
        }
    
        const userPokemonList = user.trainerPokemons;
        const existingPokemon = userPokemonList.find((pokemon) => pokemon.id === pokemonToAdd.id);
    
        if (existingPokemon) {
            return "This pokemon already exists for the user";
        }

        const freeBox = user.boxes[0];
    
        const trainerPokemon = new TrainerPokemon();
        trainerPokemon.userId = user.id;
        trainerPokemon.pokemonId = pokemonToAdd.id;
        trainerPokemon.boxId = freeBox.id;
        trainerPokemon.level = 1;
    
        await this.userRepository.manager.save(TrainerPokemon, trainerPokemon);
    
        return this.getUserById(user.id);
    }

    async removePokemonFromUser(requestQuery: any) {
        const trainerPokemonId = parseInt(requestQuery.trainerPokemonId);
        const userId = parseInt(requestQuery.userId);
          
        const user = await this.getUserById(userId);
    
        if(!user) {
            return "This user doesn't exist"
        }
        const pokemonTrainerToRemove = user.trainerPokemons.find((pokemons) => pokemons.id === trainerPokemonId);
        
        if(!pokemonTrainerToRemove) {
          return "This pokemon doesn't exists in the user.";
        }
    
        await this.userRepository.manager.delete(TrainerPokemon, pokemonTrainerToRemove);
    
        return this.getUserById(userId);
      }
    

    async removeUser(id: number) {
        const userToRemove = await this.userRepository.findOne({ where: { id } });
        if (!userToRemove) {
            return "User not found";
        }

        await this.userRepository.remove(userToRemove);
        return "User has been removed";
    }
}

const userService = new UserService();

export {
    userService,
};
