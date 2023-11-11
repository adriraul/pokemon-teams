import { AppDataSource } from "../data-source"
import { PokemonInBox } from "../entity/PokemonInBox";

export class PokemonInBoxService {
    private pokemonInBoxRepository = AppDataSource.getRepository(PokemonInBox);

    async getByBoxIdAndPokemonId (boxId: number, pokemonId: number) {
        const box = await this.pokemonInBoxRepository.findOne({ 
            where: {
                pokemonId: pokemonId,
                boxId: boxId,
              }, 
            relations: ['pokemonsInBox', 'pokemonsInBox.pokemon'], 
          });
        return box;
    }
}