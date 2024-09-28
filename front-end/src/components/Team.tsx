import React from "react";
import { TrainerPokemon } from "../services/api";
import { ListGroup } from "react-bootstrap";
import PokemonInTeam from "./PokemonInTeam";
import "./styles/TeamStyles.css";

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

  const teamSlots = Array.from({ length: MAX_POKEMONS }).map((_, index) => {
    const trainerPokemon = trainerPokemons && trainerPokemons[index];

    return (
      <PokemonInTeam
        key={index}
        trainerPokemon={trainerPokemon}
        rowHeight={`${100 / MAX_POKEMONS}%`} // Ajustamos cada fila en partes iguales
        onRefetch={onRefetch}
      />
    );
  });

  return (
    <div className="team-container">
      <h2 className="team-title">Equipo</h2>
      <ListGroup className="pokemon-team-list">{teamSlots}</ListGroup>
    </div>
  );
};

export default Team;
