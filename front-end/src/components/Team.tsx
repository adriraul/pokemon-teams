import React from "react";
import { TrainerPokemon } from "../services/api";
import { Card, ListGroup } from "react-bootstrap";
import PokemonInTeam from "./PokemonInTeam";

interface TeamProps {
  teamName: string;
  trainerPokemons?: TrainerPokemon[];
  onRefetch: () => void;
}

const Team: React.FC<TeamProps> = ({
  teamName,
  trainerPokemons,
  onRefetch,
}) => {
  const MAX_POKEMONS = 6;
  const BOX_HEIGHT = "80vh";
  const ROW_HEIGHT = `calc(${BOX_HEIGHT} / ${MAX_POKEMONS})`;

  const teamSlots = Array.from({ length: MAX_POKEMONS }).map((_, index) => {
    const trainerPokemon = trainerPokemons && trainerPokemons[index];

    return (
      <PokemonInTeam
        key={index}
        trainerPokemon={trainerPokemon}
        rowHeight={ROW_HEIGHT}
        onRefetch={onRefetch}
      />
    );
  });

  return (
    <Card className="pb-3" bg="dark">
      <Card.Body
        className="pokemon-in-team"
        style={{ height: "100%", borderRadius: "5%" }}
      >
        <ListGroup className="pokemon-team-list" horizontal>
          {teamSlots}
        </ListGroup>
      </Card.Body>
    </Card>
  );
};

export default Team;
