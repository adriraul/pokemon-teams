import React from "react";
import { Pokemon } from "../services/api";
import { Card, Image } from "react-bootstrap";

const PokemonCard: React.FC<{ pokemon: Pokemon }> = ({ pokemon }) => {
  return (
    <div className="col-lg-3 col-md-4 col-sm-6">
      <Card className="mb-3 pokemonCardBackground">
        <Image
          src={`/images/pokedex/${String(pokemon.pokedex_id).padStart(
            3,
            "0"
          )}.png`}
          alt={pokemon.name}
          className="card-img-top"
        />
        <Card.Body>
          <Card.Title>{pokemon.name}</Card.Title>
          <div className="type-images">
            {pokemon.pokemonTypes.map((type, index) => (
              <React.Fragment key={type.name}>
                {index > 0 && <span className="ms-2" />}
                <Image
                  src={`/images/pokemon_types/${type.name}.png`}
                  alt={type.name}
                  className="type-image"
                />
              </React.Fragment>
            ))}
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default PokemonCard;
