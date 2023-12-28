import axios, { AxiosError, AxiosInstance } from "axios";
import authHeader from "./authHeader";

export interface User {
  username: string;
  email: string;
  trainerPokemons: TrainerPokemon[];
  boxes: BoxData[];
  teams: TeamData[];
}

export interface Pokemon {
  id: number;
  name: string;
  pokedex_id: string;
  pokemonTypes: PokemonType[];
}

export interface TrainerPokemon {
  id: number;
  level: string;
  pokemon: Pokemon;
}

export interface PokemonType {
  id: number;
  name: string;
}

export interface BoxData {
  id: number;
  name: string;
  trainerPokemons: TrainerPokemon[];
}

export interface TeamData {
  id: number;
  name: string;
  trainerPokemons: TrainerPokemon[];
}

const api: AxiosInstance = axios.create({
  baseURL: "http://localhost:8080",
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response && error.response.status === 401) {
      console.error("Token expired. Perform logout.");
    } else {
      console.error("Error: ", error.message);
    }
    return Promise.reject(error);
  }
);

export const getPokemonList = async (): Promise<Pokemon[]> => {
  try {
    const response = await api.get("/pokemon", {
      headers: authHeader(),
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching data: ", error);
    throw error;
  }
};

export const getUserBoxes = async (): Promise<BoxData[]> => {
  try {
    const response = await api.get("/user/allBoxes", {
      headers: authHeader(),
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching data: ", error);
    throw error;
  }
};

export const addPokemonToUser = async (pokedexId: string): Promise<User> => {
  try {
    const response = await api.post(
      "/user/addPokemonToUser?pokedexId=" + pokedexId,
      {},
      {
        headers: authHeader(),
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching data: ", error);
    throw error;
  }
};
