import React from "react";
import { Pokemon } from "../services/api";

const PokemonCard: React.FC<{ pokemon: Pokemon }> = ({ pokemon }) => {
  return (
    <div className="col-lg-3 col-md-4 col-sm-6">
      <div className="card mb-3">
        <img
          src={`/images/pokedex/${String(pokemon.pokedex_id).padStart(
            3,
            "0"
          )}.png`}
          className="card-img-top"
          alt={pokemon.name}
        />
        <div className="card-body">
          <h5 className="card-title">{pokemon.name}</h5>
          <div className="type-images">
            {pokemon.pokemonTypes.map((type, index) => (
              <React.Fragment key={type.name}>
                {index > 0 && <span className="ms-2" />}
                <img
                  src={`/images/pokemon_types/${type.name}.png`}
                  alt={type.name}
                  className="type-image"
                />
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PokemonCard;
