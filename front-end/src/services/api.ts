import axios, { AxiosError, AxiosInstance } from "axios";
import authHeader from "./authHeader";

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
  name: string;
}

export interface BoxData {
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
      // Token expirado, realiza la acción necesaria (por ejemplo, logout)
      console.error("Token expired. Perform logout.");
    } else {
      // Manejar otros errores si es necesario
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
