import React, { useRef } from "react";
import {
  dragPokemonInTeam,
  movePokemonFromBoxToTeam,
  TrainerPokemon,
} from "../services/api";
import { ListGroup } from "react-bootstrap";
import PokemonInTeam from "./PokemonInTeam";
import "./styles/TeamStyles.css";
import { useDrop, DropTargetMonitor } from "react-dnd";
import { ItemTypes } from "../utils/itemTypes";

interface TeamProps {
  teamId: number;
  teamName: string;
  trainerPokemons?: TrainerPokemon[];
  onRefetch: () => void;
}

interface PokemonDragItem {
  id: number;
  orderInBox?: number;
  orderInTeam?: number;
}

const Team: React.FC<TeamProps> = ({
  teamId,
  teamName,
  trainerPokemons,
  onRefetch,
}) => {
  const MAX_POKEMONS = 6;
  const slotRefs = useRef<(HTMLDivElement | null)[]>([]);

  const [{ isOver }, drop] = useDrop<
    PokemonDragItem,
    void,
    { isOver: boolean }
  >({
    accept: [ItemTypes.POKEMON_FROM_BOX, ItemTypes.POKEMON_FROM_TEAM],
    drop: (item, monitor) => {
      handleDrop(item, monitor);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  const handleDrop = async (
    item: PokemonDragItem,
    monitor: DropTargetMonitor
  ) => {
    const clientOffset = monitor.getClientOffset();
    if (!clientOffset) return;

    const dropIndex = slotRefs.current.findIndex((slotRef) => {
      if (!slotRef) return false;
      const rect = slotRef.getBoundingClientRect();
      return (
        clientOffset.y >= rect.top &&
        clientOffset.y <= rect.bottom &&
        clientOffset.x >= rect.left &&
        clientOffset.x <= rect.right
      );
    });

    if (dropIndex === -1) return;

    if (item.orderInBox !== undefined) {
      await movePokemonFromBoxToTeam(item.id, dropIndex + 1, teamId);
    } else if (item.orderInTeam !== undefined) {
      await dragPokemonInTeam(item.id, dropIndex + 1, teamId);
    }
    onRefetch();
  };

  const teamSlots = Array.from({ length: MAX_POKEMONS }).map((_, index) => {
    const trainerPokemon = trainerPokemons?.find(
      (pokemon) => pokemon.orderInTeam === index + 1
    );

    return (
      <div
        key={index}
        ref={(el) => (slotRefs.current[index] = el)}
        style={{ height: `${100 / MAX_POKEMONS}%` }}
      >
        <PokemonInTeam
          key={index}
          trainerPokemon={trainerPokemon}
          rowHeight={`${100 / MAX_POKEMONS}%`}
          onRefetch={onRefetch}
          orderInTeam={trainerPokemon?.orderInTeam}
        />
      </div>
    );
  });

  return (
    <div className="team-container" ref={drop}>
      <h2 className="team-title">PARTY</h2>
      <ListGroup className="pokemon-team-list">{teamSlots}</ListGroup>
    </div>
  );
};

export default Team;
