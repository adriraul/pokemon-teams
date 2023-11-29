import React from 'react';
import { Pokemon } from '../services/api'

const PokemonCard: React.FC<{ pokemon: Pokemon }> = ({ pokemon }) => {
  return (
    <div className="card mb-3">
      <img src={`/images/pokedex/${pokemon.pokedex_id}.png`} className="card-img-top" alt={pokemon.name} />
      <div className="card-body">
        <h5 className="card-title">{pokemon.name}</h5>
      </div>
    </div>
  );
};

export default PokemonCard;
