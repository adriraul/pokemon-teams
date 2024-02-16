import axios, { AxiosError, AxiosInstance } from "axios";
import authHeader from "./authHeader";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
  orderInBox: number;
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

export interface OpenBoxData {
  newBalance: string;
  pokemonPokedexId: string;
}

export interface UserUpdatedBalanceData {
  newBalance: string;
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

export const getUserTeams = async (): Promise<TeamData[]> => {
  try {
    const response = await api.get("/user/allTeams", {
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

export const removePokemonFromUser = async (
  trainerPokemonId: number
): Promise<User> => {
  try {
    const response = await api.delete(
      "/user/removePokemonFromUser?trainerPokemonId=" + trainerPokemonId,
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

export const assignPokemonToFirstTeam = async (
  trainerPokemonIdToTeam: number
): Promise<void> => {
  try {
    const response = await api.post(
      "/user/assignPokemonToFirstTeam?trainerPokemonIdToTeam=" +
        trainerPokemonIdToTeam,
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

export const sendPokemonToFirstBox = async (
  trainerPokemonIdToBox: number
): Promise<void> => {
  try {
    const response = await api.post(
      "/user/sendPokemonToFirstBox?trainerPokemonIdToBox=" +
        trainerPokemonIdToBox,
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

export const changeBoxForTeamPokemon = async (
  trainerPokemonIdToTeam: number,
  trainerPokemonIdToBox: number
): Promise<void> => {
  try {
    const response = await api.post(
      "/user/switchBoxForTeamPokemon?trainerPokemonIdToTeam=" +
        trainerPokemonIdToTeam +
        "&trainerPokemonIdToBox=" +
        trainerPokemonIdToBox,
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

export const openPokeball = async (
  pokeballType: string
): Promise<OpenBoxData> => {
  try {
    const response = await api.post(
      "/user/openPokeball",
      { pokeballType },
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

export const redeemCode = async (
  code: string
): Promise<UserUpdatedBalanceData | null> => {
  try {
    const response = await api.post(
      "/user/redeemCode?code=" + code,
      {},
      {
        headers: authHeader(),
      }
    );
    toast.success("Code applied.");
    return response.data;
  } catch (error) {
    showError(error);
    return null; // Devuelve null en caso de error
  }
};

const showError = (error: any) => {
  if (typeof error === "object" && (error as any).response?.data?.error) {
    const errorMessage = (error as any).response.data.error;
    toast.error(errorMessage);
  } else {
    toast.error("An unknown error occurred");
  }
};
