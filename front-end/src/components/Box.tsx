import React from "react";
import { Pokemon, TrainerPokemon } from "../services/api";
import { Card, ListGroup } from "react-bootstrap";

interface BoxProps {
  boxName: string;
  trainerPokemons?: TrainerPokemon[];
}

const Box: React.FC<BoxProps> = ({ boxName, trainerPokemons }) => {
  const MAX_POKEMONS = 30;
  const POKEMONS_PER_ROW = 6;
  const TOTAL_ROWS = 5;
  const BOX_HEIGHT = "80vh";
  const ROW_HEIGHT = `calc(${BOX_HEIGHT} / ${TOTAL_ROWS + 1})`;

  const renderPokemonItems = () => {
    const totalPokemons = Math.min(trainerPokemons?.length || 0, MAX_POKEMONS);
    const totalRows = Math.ceil(totalPokemons / POKEMONS_PER_ROW);
    const pokemonWidthPercentage = 100 / POKEMONS_PER_ROW;

    const pokemonItems = [];
    for (let i = 0; i < totalRows * POKEMONS_PER_ROW; i++) {
      const pokemonIndex = i;
      const trainerPokemon = trainerPokemons?.[pokemonIndex];

      const pokemonItem = (
        <ListGroup.Item
          key={i}
          style={{
            flex: `0 0 ${pokemonWidthPercentage}%`,
            margin: 0,
            padding: 0,
            position: "relative",
            overflow: "hidden",
            height: ROW_HEIGHT, // Establecer la altura de cada fila
          }}
        >
          {trainerPokemon && (
            <img
              src={`/images/pokedex/${String(
                trainerPokemon.pokemon.pokedex_id
              ).padStart(3, "0")}.png`}
              alt={trainerPokemon.pokemon.name}
              style={{
                width: "100%",
                height: "100%",
                backgroundColor: "transparent",
                borderRadius: "5px",
                objectFit: "contain",
              }}
            />
          )}
        </ListGroup.Item>
      );

      pokemonItems.push(pokemonItem);
    }

    return pokemonItems;
  };

  return (
    <Card
      style={{
        height: BOX_HEIGHT,
        backgroundImage: `linear-gradient(rgba(51, 51, 51, 0), rgba(51, 51, 51, 0.5)), url('/images/backgrounds/darkrai.webp')`,
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        padding: "20px",
      }}
    >
      <Card.Body
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          height: "100%",
        }}
      >
        <div
          className="d-flex flex-wrap justify-content-between"
          style={{
            width: "100%",
            maxWidth: `${POKEMONS_PER_ROW * (100 / POKEMONS_PER_ROW)}%`,
            height: "100%",
          }}
        >
          {renderPokemonItems()}
        </div>
      </Card.Body>
    </Card>
  );
};

export default Box;
