import React, { useEffect, useState } from 'react';
import { getPokemonList } from '../services/api';

interface Pokemon {
  name: string;
}

const PokemonList: React.FC = () => {
  const [pokemonList, setPokemonList] = useState<Pokemon[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getPokemonList();
        setPokemonList(data);
      } catch (error) {
        // Handle error if needed
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      <ul>
        {pokemonList.map(pokemon => (
          <li key={pokemon.name}>{pokemon.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default PokemonList;
