import { AppDataSource } from "../data-source";
import { User } from "../entity/User";
import { pokemonService } from "./PokemonService";
import { Pokemon } from "../entity/Pokemon";
import { GameLevel } from "../entity/GameLevel";
import { GameLevelPokemons } from "../entity/GameLevelPokemons";

export class GameLevelService {
  private gameLevelRepository = AppDataSource.getRepository(GameLevel);
  private gameLevelPokemonRepository =
    AppDataSource.getRepository(GameLevelPokemons);

  private pokemonArrays: { [key: number]: Pokemon[] } = {};

  async getGameLevelsByUser(userId: number) {
    return this.gameLevelRepository.find({
      where: { user: { id: userId } },
      relations: ["gameLevelPokemons", "gameLevelPokemons.pokemon"],
    });
  }

  async createLevels(user: User) {
    this.pokemonArrays[3] = await pokemonService.getAllByPower(3);
    this.pokemonArrays[4] = await pokemonService.getAllByPower(4);
    this.pokemonArrays[5] = await pokemonService.getAllByPower(5);
    this.pokemonArrays[6] = await pokemonService.getAllByPower(6);
    this.pokemonArrays[8] = await pokemonService.getAllByPower(8);
    this.pokemonArrays[10] = await pokemonService.getAllByPower(10);

    let levelOrder = 1;
    for (let i = 1; i <= 18; i++) {
      const blocked = i === 1 ? false : true;
      await this.createLevel(user, i, blocked, levelOrder);
      levelOrder++;
      await this.createLevel(user, i, true, levelOrder);
      levelOrder++;
    }
  }

  createGameLevelPokemon = (
    gameLevel: GameLevel,
    pokemon: Pokemon,
    order: number
  ): GameLevelPokemons => {
    const gameLevelPokemon = new GameLevelPokemons();
    gameLevelPokemon.gameLevel = gameLevel;
    gameLevelPokemon.pokemon = pokemon;
    gameLevelPokemon.order = order;
    return gameLevelPokemon;
  };

  getRandomPokemon = (
    pokemonArray: Pokemon[],
    existingPokemons: Pokemon[]
  ): Pokemon => {
    let randomPokemon: Pokemon | null = null;

    // Genera un Pokémon aleatorio
    while (!randomPokemon) {
      const randomIndex = Math.floor(Math.random() * pokemonArray.length);
      const selectedPokemon = pokemonArray[randomIndex];

      // Verifica si el Pokémon seleccionado ya existe en el nivel
      const isExistingPokemon = existingPokemons.some(
        (pokemon) => pokemon.id === selectedPokemon.id
      );

      // Si el Pokémon no existe en el nivel, asigna el Pokémon aleatorio seleccionado
      if (!isExistingPokemon) {
        randomPokemon = selectedPokemon;
      }
    }

    return randomPokemon;
  };

  async createLevel(
    user: User,
    levelNumber: number,
    blocked: boolean,
    levelOrder: number
  ) {
    const level = new GameLevel();
    level.user = user;
    level.passed = false;
    level.blocked = blocked;
    level.active = true;
    level.number = levelOrder;
    level.reward = 25 * (levelNumber - 1) + 50;

    const savedLevel = await this.gameLevelRepository.save(level);

    const gameLevelPokemons: GameLevelPokemons[] = [];
    const existingPokemons: Pokemon[] = [];

    switch (levelNumber) {
      case 1:
        for (let i = 0; i < 6; i++) {
          const pokemon = this.getRandomPokemon(
            this.pokemonArrays[3],
            existingPokemons
          );
          gameLevelPokemons.push(
            this.createGameLevelPokemon(savedLevel, pokemon, i + 1)
          );
          existingPokemons.push(pokemon);
        }
        break;
      case 2:
        for (let i = 0; i < 5; i++) {
          const pokemon = this.getRandomPokemon(
            this.pokemonArrays[3],
            existingPokemons
          );
          gameLevelPokemons.push(
            this.createGameLevelPokemon(savedLevel, pokemon, i + 1)
          );
          existingPokemons.push(pokemon);
        }
        const pokemon4 = this.getRandomPokemon(
          this.pokemonArrays[4],
          existingPokemons
        );
        gameLevelPokemons.push(
          this.createGameLevelPokemon(savedLevel, pokemon4, 6)
        );
        break;
      case 3:
        for (let i = 0; i < 4; i++) {
          const pokemon = this.getRandomPokemon(
            this.pokemonArrays[3],
            existingPokemons
          );
          gameLevelPokemons.push(
            this.createGameLevelPokemon(savedLevel, pokemon, i + 1)
          );
          existingPokemons.push(pokemon);
        }
        for (let i = 0; i < 2; i++) {
          const pokemon = this.getRandomPokemon(
            this.pokemonArrays[4],
            existingPokemons
          );
          gameLevelPokemons.push(
            this.createGameLevelPokemon(savedLevel, pokemon, i + 5)
          );
          existingPokemons.push(pokemon);
        }
        break;
      case 4:
        for (let i = 0; i < 3; i++) {
          const pokemon = this.getRandomPokemon(
            this.pokemonArrays[3],
            existingPokemons
          );
          gameLevelPokemons.push(
            this.createGameLevelPokemon(savedLevel, pokemon, i + 1)
          );
          existingPokemons.push(pokemon);
        }
        for (let i = 0; i < 3; i++) {
          const pokemon = this.getRandomPokemon(
            this.pokemonArrays[4],
            existingPokemons
          );
          gameLevelPokemons.push(
            this.createGameLevelPokemon(savedLevel, pokemon, i + 4)
          );
          existingPokemons.push(pokemon);
        }
        break;
      case 5:
        for (let i = 0; i < 2; i++) {
          const pokemon = this.getRandomPokemon(
            this.pokemonArrays[3],
            existingPokemons
          );
          gameLevelPokemons.push(
            this.createGameLevelPokemon(savedLevel, pokemon, i + 1)
          );
          existingPokemons.push(pokemon);
        }
        for (let i = 0; i < 4; i++) {
          const pokemon = this.getRandomPokemon(
            this.pokemonArrays[4],
            existingPokemons
          );
          gameLevelPokemons.push(
            this.createGameLevelPokemon(savedLevel, pokemon, i + 3)
          );
          existingPokemons.push(pokemon);
        }
        break;
      case 6:
        for (let i = 0; i < 1; i++) {
          const pokemon = this.getRandomPokemon(
            this.pokemonArrays[3],
            existingPokemons
          );
          gameLevelPokemons.push(
            this.createGameLevelPokemon(savedLevel, pokemon, i + 1)
          );
          existingPokemons.push(pokemon);
        }
        for (let i = 0; i < 5; i++) {
          const pokemon = this.getRandomPokemon(
            this.pokemonArrays[4],
            existingPokemons
          );
          gameLevelPokemons.push(
            this.createGameLevelPokemon(savedLevel, pokemon, i + 2)
          );
          existingPokemons.push(pokemon);
        }
        break;
      case 7:
        for (let i = 0; i < 6; i++) {
          const pokemon = this.getRandomPokemon(
            this.pokemonArrays[4],
            existingPokemons
          );
          gameLevelPokemons.push(
            this.createGameLevelPokemon(savedLevel, pokemon, i + 1)
          );
          existingPokemons.push(pokemon);
        }
        break;
      case 8:
        for (let i = 0; i < 5; i++) {
          const pokemon = this.getRandomPokemon(
            this.pokemonArrays[4],
            existingPokemons
          );
          gameLevelPokemons.push(
            this.createGameLevelPokemon(savedLevel, pokemon, i + 1)
          );
          existingPokemons.push(pokemon);
        }
        const pokemon5 = this.getRandomPokemon(
          this.pokemonArrays[5],
          existingPokemons
        );
        gameLevelPokemons.push(
          this.createGameLevelPokemon(savedLevel, pokemon5, 6)
        );
        break;
      case 9:
        for (let i = 0; i < 4; i++) {
          const pokemon = this.getRandomPokemon(
            this.pokemonArrays[5],
            existingPokemons
          );
          gameLevelPokemons.push(
            this.createGameLevelPokemon(savedLevel, pokemon, i + 1)
          );
          existingPokemons.push(pokemon);
        }
        for (let i = 0; i < 2; i++) {
          const pokemon = this.getRandomPokemon(
            this.pokemonArrays[6],
            existingPokemons
          );
          gameLevelPokemons.push(
            this.createGameLevelPokemon(savedLevel, pokemon, i + 5)
          );
          existingPokemons.push(pokemon);
        }
        break;
      case 10:
        for (let i = 0; i < 3; i++) {
          const pokemon = this.getRandomPokemon(
            this.pokemonArrays[5],
            existingPokemons
          );
          gameLevelPokemons.push(
            this.createGameLevelPokemon(savedLevel, pokemon, i + 1)
          );
          existingPokemons.push(pokemon);
        }
        for (let i = 0; i < 3; i++) {
          const pokemon = this.getRandomPokemon(
            this.pokemonArrays[6],
            existingPokemons
          );
          gameLevelPokemons.push(
            this.createGameLevelPokemon(savedLevel, pokemon, i + 4)
          );
          existingPokemons.push(pokemon);
        }
        break;
      case 11:
        for (let i = 0; i < 2; i++) {
          const pokemon = this.getRandomPokemon(
            this.pokemonArrays[6],
            existingPokemons
          );
          gameLevelPokemons.push(
            this.createGameLevelPokemon(savedLevel, pokemon, i + 1)
          );
          existingPokemons.push(pokemon);
        }
        for (let i = 0; i < 4; i++) {
          const pokemon = this.getRandomPokemon(
            this.pokemonArrays[8],
            existingPokemons
          );
          gameLevelPokemons.push(
            this.createGameLevelPokemon(savedLevel, pokemon, i + 3)
          );
          existingPokemons.push(pokemon);
        }
        break;
      case 12:
        for (let i = 0; i < 1; i++) {
          const pokemon = this.getRandomPokemon(
            this.pokemonArrays[6],
            existingPokemons
          );
          gameLevelPokemons.push(
            this.createGameLevelPokemon(savedLevel, pokemon, i + 1)
          );
          existingPokemons.push(pokemon);
        }
        for (let i = 0; i < 5; i++) {
          const pokemon = this.getRandomPokemon(
            this.pokemonArrays[8],
            existingPokemons
          );
          gameLevelPokemons.push(
            this.createGameLevelPokemon(savedLevel, pokemon, i + 2)
          );
          existingPokemons.push(pokemon);
        }
        break;
      case 13:
        for (let i = 0; i < 6; i++) {
          const pokemon = this.getRandomPokemon(
            this.pokemonArrays[8],
            existingPokemons
          );
          gameLevelPokemons.push(
            this.createGameLevelPokemon(savedLevel, pokemon, i + 1)
          );
          existingPokemons.push(pokemon);
        }
        break;
      case 14:
        for (let i = 0; i < 5; i++) {
          const pokemon = this.getRandomPokemon(
            this.pokemonArrays[8],
            existingPokemons
          );
          gameLevelPokemons.push(
            this.createGameLevelPokemon(savedLevel, pokemon, i + 1)
          );
          existingPokemons.push(pokemon);
        }
        const pokemon8 = this.getRandomPokemon(
          this.pokemonArrays[10],
          existingPokemons
        );
        gameLevelPokemons.push(
          this.createGameLevelPokemon(savedLevel, pokemon8, 6)
        );
        break;
      case 15:
        for (let i = 0; i < 4; i++) {
          const pokemon = this.getRandomPokemon(
            this.pokemonArrays[8],
            existingPokemons
          );
          gameLevelPokemons.push(
            this.createGameLevelPokemon(savedLevel, pokemon, i + 1)
          );
          existingPokemons.push(pokemon);
        }
        for (let i = 0; i < 2; i++) {
          const pokemon = this.getRandomPokemon(
            this.pokemonArrays[10],
            existingPokemons
          );
          gameLevelPokemons.push(
            this.createGameLevelPokemon(savedLevel, pokemon, i + 5)
          );
          existingPokemons.push(pokemon);
        }
        break;
      case 16:
        for (let i = 0; i < 3; i++) {
          const pokemon = this.getRandomPokemon(
            this.pokemonArrays[8],
            existingPokemons
          );
          gameLevelPokemons.push(
            this.createGameLevelPokemon(savedLevel, pokemon, i + 1)
          );
          existingPokemons.push(pokemon);
        }
        for (let i = 0; i < 3; i++) {
          const pokemon = this.getRandomPokemon(
            this.pokemonArrays[10],
            existingPokemons
          );
          gameLevelPokemons.push(
            this.createGameLevelPokemon(savedLevel, pokemon, i + 4)
          );
          existingPokemons.push(pokemon);
        }
        break;
      case 17:
        for (let i = 0; i < 2; i++) {
          const pokemon = this.getRandomPokemon(
            this.pokemonArrays[8],
            existingPokemons
          );
          gameLevelPokemons.push(
            this.createGameLevelPokemon(savedLevel, pokemon, i + 1)
          );
          existingPokemons.push(pokemon);
        }
        for (let i = 0; i < 4; i++) {
          const pokemon = this.getRandomPokemon(
            this.pokemonArrays[10],
            existingPokemons
          );
          gameLevelPokemons.push(
            this.createGameLevelPokemon(savedLevel, pokemon, i + 3)
          );
          existingPokemons.push(pokemon);
        }
        break;
      case 18:
        for (let i = 0; i < 1; i++) {
          const pokemon = this.getRandomPokemon(
            this.pokemonArrays[8],
            existingPokemons
          );
          gameLevelPokemons.push(
            this.createGameLevelPokemon(savedLevel, pokemon, i + 1)
          );
          existingPokemons.push(pokemon);
        }
        for (let i = 0; i < 5; i++) {
          const pokemon = this.getRandomPokemon(
            this.pokemonArrays[10],
            existingPokemons
          );
          gameLevelPokemons.push(
            this.createGameLevelPokemon(savedLevel, pokemon, i + 2)
          );
          existingPokemons.push(pokemon);
        }
        break;
      /*case 19:
        for (let i = 0; i < 6; i++) {
          const pokemon = this.getRandomPokemon(this.pokemonArrays[10]);
          gameLevelPokemons.push(
            this.createGameLevelPokemon(savedLevel, pokemon, i + 1)
          );
        }
        break;*/
    }

    await this.gameLevelPokemonRepository.save(gameLevelPokemons);
  }
}

const gameLevelService = new GameLevelService();

export { gameLevelService };
