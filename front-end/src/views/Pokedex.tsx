import React, { useState, useEffect } from 'react';
import PokemonCard from '../components/PokemonCard';
import { getPokemonList, Pokemon } from '../services/api';

const Pokedex: React.FC = () => {
  const [pokemonList, setPokemonList] = useState<Pokemon[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getPokemonList();
        // Filtrar la lista según el término de búsqueda
        const filteredPokemonList = data.filter((pokemon: Pokemon) =>
          pokemon.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setPokemonList(filteredPokemonList);
      } catch (error) {
        // Handle error if needed
      }
    };

    fetchData();
  }, [searchTerm]); 

  return (
    <div className="container mt-4">
      <h1 className="mb-4">Pokedex</h1>

      <div className="mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Buscar Pokémon por nombre"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {/*<button className="btn btn-primary mt-2" onClick={handleSearch}>
          Buscar
        </button>*/}
      </div>

      <div className="row">
        {pokemonList.map((pokemon) => (
          <div key={pokemon.name} className="col-lg-3 col-md-4 col-sm-6">
            <PokemonCard pokemon={pokemon} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Pokedex;
