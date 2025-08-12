import React, { useRef } from "react";
import { movePokemonFromTeamToBox, TrainerPokemon } from "../services/api";
import { Card } from "react-bootstrap";
import PokemonInBox from "./PokemonInBox";
import { useDrop, DropTargetMonitor } from "react-dnd";
import { ItemTypes } from "../utils/itemTypes";
import { dragPokemonInBox } from "../services/api";

interface BoxProps {
  boxId: number;
  boxName: string;
  trainerPokemons?: TrainerPokemon[];
  onRefetch: () => void;
}

interface PokemonDragItem {
  id: number;
  orderInBox?: number;
  orderInTeam?: number;
}

const Box: React.FC<BoxProps> = ({
  boxId,
  boxName,
  trainerPokemons,
  onRefetch,
}) => {
  const MAX_POKEMONS = 30;
  const POKEMONS_PER_ROW = 6;
  const TOTAL_ROWS = 5;
  const BOX_HEIGHT = 80;
  const ROW_HEIGHT = BOX_HEIGHT / (TOTAL_ROWS + 1);

  const containerRef = useRef<HTMLDivElement>(null);

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
    const delta = monitor.getClientOffset();
    if (delta && containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const x = delta.x - containerRect.left;
      const y = delta.y - containerRect.top;

      const col = Math.floor(x / (containerRect.width / POKEMONS_PER_ROW));
      const row = Math.floor(y / (containerRect.height / TOTAL_ROWS));
      const newOrderInBox = row * POKEMONS_PER_ROW + col + 1;

      if (item.orderInTeam !== undefined) {
        await movePokemonFromTeamToBox(item.id, newOrderInBox, boxId);
      } else if (item.orderInBox !== undefined) {
        await dragPokemonInBox(item.id, newOrderInBox, boxId);
      }
      onRefetch();
    }
  };

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
        <div
          style={{
            width: `${100 / POKEMONS_PER_ROW}%`,
            height: `${ROW_HEIGHT}vh`,
          }}
          key={i}
        >
          <PokemonInBox
            key={i}
            trainerPokemon={trainerPokemon}
            rowHeight="85%"
            onRefetch={onRefetch}
            orderInBox={i + 1}
          />
          <div
            style={{
              textAlign: "center",
              color: "white",
              fontSize: "1em",
              textShadow:
                ".5px .5px 1px black, 0 0 .2em black, 0 0 0.1em black",
            }}
          >
            {trainerPokemon ? trainerPokemon.nickname : ""}
          </div>
        </div>
      );
    });

    return (
      <div
        ref={containerRef}
        className="d-flex flex-wrap justify-content-start"
        style={{
          width: "100%",
          maxWidth: `${POKEMONS_PER_ROW * (100 / POKEMONS_PER_ROW)}%`,
          height: "100%",
          backgroundColor: isOver ? "rgba(255,255,255,0.1)" : "transparent",
        }}
      >
        {pokemonItems}
      </div>
    );
  };

  return (
    <Card
      className="pb-3"
      bg="dark"
      style={{
        height: `${BOX_HEIGHT}vh`,
        border: "none",
      }}
    >
      <Card.Body
        ref={drop}
        style={{
          borderRadius: "5%",
          backgroundImage: `url('/images/backgrounds/background-box.webp'`,
          boxShadow: "inset 0px -2px 1px rgba(255, 255, 255, 0.2)",
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          padding: "20px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          height: "100%",
        }}
      >
        <div
          className="d-flex flex-wrap justify-content-start"
          style={{
            width: "100%",
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
