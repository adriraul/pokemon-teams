import React from "react";
import { Table, Image } from "react-bootstrap";
import { TrainerPokemon } from "../services/api";

interface MovementsTableProps {
  trainerPokemon: TrainerPokemon | null | undefined;
}

const MovementsTable: React.FC<MovementsTableProps> = ({ trainerPokemon }) => {
  if (trainerPokemon) {
    const { movements } = trainerPokemon;

    const sortedMovements = [...movements].sort((a, b) => {
      return a.pokemonType.name.localeCompare(b.pokemonType.name);
    });

    return (
      <Table
        striped
        bordered
        hover
        size="sm"
        style={{
          marginBottom: "20px",
          background: "transparent",
          borderColor: "#666666",
        }}
      >
        <thead>
          <tr>
            <th
              style={{
                width: "50%",
                textAlign: "center",
                background: "#333333",
                color: "white",
                borderColor: "#666666",
              }}
            >
              Tipo
            </th>
            <th
              style={{
                width: "50%",
                textAlign: "center",
                background: "#333333",
                color: "white",
                borderColor: "#666666",
              }}
            >
              Movimientos
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedMovements.map((movement) => (
            <tr key={movement.id}>
              <td
                style={{
                  background: "#333333",
                  borderColor: "#666666",
                  textAlign: "center",
                }}
              >
                <Image
                  src={`/images/pokemon_types/${movement.pokemonType.name}.png`}
                  alt={movement.pokemonType.name}
                  className="type-image"
                />
              </td>
              <td
                style={{
                  background: "#333333",
                  borderColor: "#666666",
                  textAlign: "center",
                  color: "white",
                }}
              >
                {movement.quantity}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    );
  }
  return <></>;
};

export default MovementsTable;
