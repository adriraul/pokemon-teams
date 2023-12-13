import React, { useState, useEffect } from "react";
import PokemonCard from "../components/PokemonCard";
import { getPokemonList, Pokemon } from "../services/api";

const Pokedex: React.FC = () => {
  const [originalPokemonList, setOriginalPokemonList] = useState<Pokemon[]>([]);
  const [pokemonList, setPokemonList] = useState<Pokemon[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getPokemonList();
        setOriginalPokemonList(data);
        setPokemonList(data);
      } catch (error) {
        // Manejar error si es necesario
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const filteredPokemonList = originalPokemonList.filter((pokemon: Pokemon) =>
      pokemon.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setPokemonList(filteredPokemonList);
  }, [searchTerm, originalPokemonList]);

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
          <PokemonCard key={pokemon.id} pokemon={pokemon} />
        ))}
      </div>
    </div>
  );
};

export default Pokedex;
