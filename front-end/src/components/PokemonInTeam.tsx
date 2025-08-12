import React, { useState } from "react";
import { TrainerPokemon } from "../services/api";
import { ListGroup, Modal, Button, Table, Image } from "react-bootstrap";
import { sendPokemonToFirstBox } from "../services/api";
import { Radar } from "react-chartjs-2";
import { Chart, RadialLinearScale, PointElement, LineElement } from "chart.js";
import { useDrag, DragSourceMonitor } from "react-dnd";
import { ItemTypes } from "../utils/itemTypes";
import MovementsTable from "./MovementsTable";

Chart.register(RadialLinearScale, PointElement, LineElement);

interface PokemonInTeamProps {
  trainerPokemon?: TrainerPokemon;
  rowHeight: string;
  onRefetch: () => void;
  orderInTeam?: number;
}

const PokemonInTeam: React.FC<PokemonInTeamProps> = ({
  trainerPokemon,
  rowHeight,
  onRefetch,
  orderInTeam,
}) => {
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [showMoveToBoxModal, setShowMoveToBoxModal] = useState(false);

  const [{ isDragging }, drag, preview] = useDrag({
    type: ItemTypes.POKEMON_FROM_TEAM,
    item: { id: trainerPokemon?.id, orderInTeam },
    collect: (monitor: DragSourceMonitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  });

  const handleOptionsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowOptionsModal(true);
  };

  const handleMoveToBoxClick = () => {
    setShowOptionsModal(false);
    setShowMoveToBoxModal(true);
  };

  const handleCancelMoveToBox = () => {
    setShowMoveToBoxModal(false);
  };

  const handleConfirmMoveToBox = async () => {
    try {
      if (trainerPokemon) {
        await sendPokemonToFirstBox(trainerPokemon.id);
        setShowMoveToBoxModal(false);
        onRefetch();
      }
    } catch (error) {
      console.error("Error al confirmar asignación al equipo", error);
    }
  };

  const renderRadarChart = () => {
    if (!trainerPokemon) return null;

    const data = {
      labels: ["PS", "Atk", "Def"],
      datasets: [
        {
          label: "Pokémon IVs",
          data: [
            trainerPokemon.ivPS || 0,
            trainerPokemon.ivAttack || 0,
            trainerPokemon.ivDefense || 0,
          ],
          backgroundColor: "rgba(54, 162, 235, 0.2)",
          borderColor: "white",
          borderWidth: 1,
          pointBackgroundColor: "white",
          pointBorderColor: "#fff",
          pointHoverRadius: 5,
          pointRadius: 3,
        },
      ],
    };

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        r: {
          angleLines: {
            display: true,
          },
          beginAtZero: true,
          min: 0,
          max: 31,
          ticks: {
            display: false,
          },
          grid: {
            color: "rgba(255, 255, 255, 0.1)",
          },
          pointLabels: {
            color: "white",
            font: {
              size: 14,
            },
          },
        },
      },
    };

    return (
      <div style={{ width: "250px", height: "250px" }}>
        <Radar data={data} options={options} />
      </div>
    );
  };

  return (
    <>
      <div
        ref={drag}
        className="list-group-item pokemon-in-team"
        style={{ height: rowHeight, opacity: isDragging ? 0.5 : 1 }}
        onClick={handleOptionsClick}
      >
        {trainerPokemon ? (
          <>
            <img
              src={`/images/pokedex/${String(
                trainerPokemon.pokemon.pokedex_id
              ).padStart(3, "0")}.avif`}
              alt={trainerPokemon.pokemon.name}
              title={trainerPokemon.pokemon.name}
              style={{
                cursor: "pointer",
                filter:
                  trainerPokemon.movements.reduce(
                    (total, movement) => total + movement.quantity,
                    0
                  ) === 0
                    ? "grayscale(1)"
                    : "none",
              }}
            />
            <div className="pokemon-info">
              <span className="pokemon-info-name">
                {trainerPokemon.pokemon.name}
              </span>
              <span className="pokemon-info-level">
                Lv. {trainerPokemon.pokemon.power}
              </span>
            </div>
          </>
        ) : (
          <div className="pokemon-info-empty">
            <span className="pokemon-info-name">Empty</span>
          </div>
        )}
      </div>

      {/* Modal de opciones */}
      <Modal
        show={showOptionsModal}
        onHide={() => setShowOptionsModal(false)}
        size="sm"
        centered
      >
        <Modal.Body
          style={{
            borderRadius: "5px",
            padding: "10px",
            marginTop: "50px",
            marginBottom: "50px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
          }}
        >
          {renderRadarChart()}
          {<MovementsTable trainerPokemon={trainerPokemon} />}
          <div>
            <Button variant="secondary" onClick={handleMoveToBoxClick}>
              Send to box
            </Button>
          </div>
        </Modal.Body>
      </Modal>

      {/* Modal de mover a la caja */}
      <Modal
        show={showMoveToBoxModal}
        onHide={handleCancelMoveToBox}
        size="sm"
        centered
      >
        <Modal.Header
          style={{
            background: "#333333",
            border: "1px solid #666666",
            padding: "8px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Modal.Title style={{ color: "white" }}>
            ¿Seguro que quieres enviar a {trainerPokemon?.pokemon.name} a la
            caja?
          </Modal.Title>
        </Modal.Header>
        <Modal.Body
          style={{
            background: "#333333",
            border: "1px solid #666666",
            padding: "8px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {trainerPokemon && (
            <img
              src={`/images/pokedex/${String(
                trainerPokemon.pokemon.pokedex_id
              ).padStart(3, "0")}.avif`}
              alt={trainerPokemon.pokemon.name}
              style={{
                width: "100%",
                height: "auto",
                backgroundColor: "transparent",
                borderRadius: "5px",
                objectFit: "contain",
              }}
            />
          )}
        </Modal.Body>
        <Modal.Footer
          style={{
            background: "#333333",
            border: "1px solid #666666",
            padding: "8px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Button variant="secondary" onClick={handleCancelMoveToBox}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={handleConfirmMoveToBox}>
            Enviar
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default PokemonInTeam;
