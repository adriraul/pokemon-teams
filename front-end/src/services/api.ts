import axios from "axios";

export interface Pokemon {
  name: string;
  pokedex_id: string;
}

export const getPokemonList = async (): Promise<Pokemon[]> => {
  try {
    const response = await axios.get("http://localhost:8080/pokemon");
    return response.data;
  } catch (error) {
    console.error("Error fetching data: ", error);
    throw error;
  }
};
