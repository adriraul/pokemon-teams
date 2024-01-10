import React from "react";
import { TrainerPokemon } from "../services/api";
import { Card } from "react-bootstrap";
import PokemonInBox from "./PokemonInBox";

interface BoxProps {
  boxName: string;
  trainerPokemons?: TrainerPokemon[];
  onReleasePokemon: (releasedPokemon: TrainerPokemon | undefined) => void;
}

const Box: React.FC<BoxProps> = ({
  boxName,
  trainerPokemons,
  onReleasePokemon,
}) => {
  const MAX_POKEMONS = 30;
  const POKEMONS_PER_ROW = 6;
  const TOTAL_ROWS = 5;
  const BOX_HEIGHT = "80vh";
  const ROW_HEIGHT = `calc(${BOX_HEIGHT} / ${TOTAL_ROWS + 1})`;

  const renderPokemonItems = () => {
    const sortedPokemons = trainerPokemons
      ? trainerPokemons
          .slice()
          .sort((a, b) => (a.orderInBox || 0) - (b.orderInBox || 0))
      : [];

    const pokemonItems = Array.from({ length: MAX_POKEMONS }).map((_, i) => {
      const trainerPokemon = sortedPokemons.find(
        (pokemon) => pokemon.orderInBox === i + 1
      );

      return (
        <PokemonInBox
          key={i}
          trainerPokemon={trainerPokemon}
          rowHeight={ROW_HEIGHT}
          onRelease={onReleasePokemon}
        />
      );
    });

    return (
      <div
        className="d-flex flex-wrap justify-content-start"
        style={{
          width: "100%",
          maxWidth: `${POKEMONS_PER_ROW * (100 / POKEMONS_PER_ROW)}%`,
          height: "100%",
        }}
      >
        {pokemonItems}
      </div>
    );
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
