import React, { useState, useEffect } from "react";
import { TrainerPokemon } from "../services/api";
import { ListGroup, Modal, Button, Table, Image } from "react-bootstrap";
import {
  removePokemonFromUser,
  getUserTeams,
  assignPokemonToFirstTeam,
  changeBoxForTeamPokemon,
} from "../services/api";
import "../components/styles/PokemonInBox.css";
import { useAppDispatch } from "../hooks/redux/hooks";
import { updateBalance } from "../services/auth/authSlice";
import { useDrag, DragSourceMonitor } from "react-dnd";
import { ItemTypes } from "../utils/itemTypes";
import "./styles/BoxStyles.css";
import { Radar } from "react-chartjs-2";
import { Chart, RadialLinearScale, PointElement, LineElement } from "chart.js";

Chart.register(RadialLinearScale, PointElement, LineElement);

interface PokemonInBoxProps {
  trainerPokemon?: TrainerPokemon;
  rowHeight: string;
  onRefetch: () => void;
  orderInBox: number;
}

const PokemonInBox: React.FC<PokemonInBoxProps> = ({
  trainerPokemon,
  rowHeight,
  onRefetch,
  orderInBox,
}) => {
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [showReleaseModal, setShowReleaseModal] = useState(false);
  const [showAssignToTeamModal, setShowAssignToTeamModal] = useState(false);
  const [showSelectPokemonFromTeamModal, setShowSelectPokemonFromTeamModal] =
    useState(false);
  const [team, setTeam] = useState<TrainerPokemon[]>([]);
  const [sellPrice, setSellPrice] = useState(0);
  const dispatch = useAppDispatch();

  const [{ isDragging }, drag, preview] = useDrag({
    type: ItemTypes.POKEMON,
    item: { id: trainerPokemon?.id, orderInBox },
    collect: (monitor: DragSourceMonitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  });

  useEffect(() => {
    if (trainerPokemon) {
      const img = document.createElement("img");
      img.src = `/images/pokedex/${String(
        trainerPokemon.pokemon.pokedex_id
      ).padStart(3, "0")}.avif`;
      img.onload = () => preview(img);
    }
  }, [trainerPokemon, preview]);

  useEffect(() => {
    if (trainerPokemon) {
      calculateSellPrice(trainerPokemon);
    }
  }, [trainerPokemon]);

  const calculateSellPrice = (pokemon: TrainerPokemon) => {
    const maxMoves = 40;
    const basePrice = (pokemon.pokemon.power / 2) * 45 - 1;

    const totalMoves = pokemon.movements.reduce((total, movement) => {
      return total + movement.quantity;
    }, 0);

    const movesRemaining = maxMoves - totalMoves;
    const percentageRemaining = movesRemaining / maxMoves;

    const discount = percentageRemaining / 2;

    const finalPrice = Math.round(basePrice * (1 - discount));

    setSellPrice(finalPrice);
  };

  const handleOptionsClick = () => {
    setShowOptionsModal(true);
  };

  const handleRelease = () => {
    setShowOptionsModal(false);
    setShowReleaseModal(true);
  };

  const handleAssignToTeam = () => {
    setShowOptionsModal(false);
    setShowAssignToTeamModal(true);
  };

  const handleConfirmAssignToTeam = async () => {
    try {
      if (trainerPokemon) {
        const userTeams = await getUserTeams();
        if (userTeams) {
          const currentPokemonsTeam = userTeams[0]?.trainerPokemons;

          if (currentPokemonsTeam.length < 6) {
            await assignPokemonToFirstTeam(trainerPokemon.id);
            onRefetch();
            setShowAssignToTeamModal(false);
          } else {
            setShowAssignToTeamModal(false);
            setTeam(currentPokemonsTeam);
            setShowSelectPokemonFromTeamModal(true);
          }
        }
      }
    } catch (error) {
      console.error("Error al confirmar asignación al equipo", error);
    }
  };

  const handleSelectPokemonToSwitch = async (
    pokemonToRemove: TrainerPokemon | undefined
  ) => {
    try {
      if (pokemonToRemove && trainerPokemon) {
        await changeBoxForTeamPokemon(trainerPokemon.id, pokemonToRemove.id);
        setShowSelectPokemonFromTeamModal(false);
        onRefetch();
      }
    } catch (error) {
      console.error("Error al seleccionar Pokémon para cambiar", error);
    }
  };

  const handleCancelRelease = () => {
    setShowReleaseModal(false);
  };

  const handleCancelAssingToTeam = () => {
    setShowAssignToTeamModal(false);
  };

  const releasePokemon = async (trainerPokemon: TrainerPokemon | undefined) => {
    if (trainerPokemon) {
      try {
        const response = await removePokemonFromUser(trainerPokemon.id);
        if (response) dispatch(updateBalance(String(response.balance)));
        setShowReleaseModal(false);
      } catch (error) {
        console.error("Error al liberar al Pokémon", error);
      }
    }
  };

  const handleConfirmRelease = () => {
    releasePokemon(trainerPokemon);
    onRefetch();
  };

  const randomAnimation = () => {
    const number = Math.floor(Math.random() * 1) + 1;
    if (number % 2 === 0) {
      return true;
    } else {
      return false;
    }
  };

  const renderRadarChart = () => {
    if (!trainerPokemon) return null;

    const data = {
      labels: ["PS", "Atk", "Def"],
      datasets: [
        {
          label: "IVs del Pokémon",
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

  const renderMovementsTable = () => {
    if (!trainerPokemon) return null;

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
          {trainerPokemon.movements.map((movement) => (
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
                  style={{ margin: "auto" }}
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
  };

  return (
    <>
      <ListGroup.Item
        style={{
          flex: "0 0 16.6667%",
          margin: 0,
          padding: 0,
          position: "relative",
          overflow: "hidden",
          height: rowHeight,
          opacity: isDragging ? 0.5 : 1,
          backgroundColor: "transparent",
        }}
        ref={drag}
      >
        {trainerPokemon && (
          <img
            src={`/images/pokedex/${String(
              trainerPokemon.pokemon.pokedex_id
            ).padStart(3, "0")}.avif`}
            alt={trainerPokemon.pokemon.name}
            className={
              randomAnimation() ? "pokemon-image-jump1" : "pokemon-image-jump2"
            }
            style={{
              width: "100%",
              height: "100%",
              backgroundColor: "transparent",
              borderRadius: "5px",
              objectFit: "contain",
              cursor: "pointer",
              filter:
                trainerPokemon.movements.reduce(
                  (total, movement) => total + movement.quantity,
                  0
                ) === 0
                  ? "grayscale(1)"
                  : "none",
            }}
            onClick={handleOptionsClick}
            title={trainerPokemon.nickname}
          />
        )}
      </ListGroup.Item>

      <Modal
        show={showOptionsModal}
        onHide={() => setShowOptionsModal(false)}
        size="sm"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>{trainerPokemon && trainerPokemon.nickname}</Modal.Title>
        </Modal.Header>
        <Modal.Body
          style={{
            borderRadius: "5px",
            padding: "10px",
            marginTop: "10px",
            marginBottom: "10px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
          }}
        >
          {renderRadarChart()}
          {renderMovementsTable()}
          <div style={{ marginBottom: "8px" }}>
            <Button variant="secondary" onClick={handleRelease}>
              {`Liberar Pokémon (${sellPrice}$)`}
            </Button>
          </div>

          <div>
            <Button variant="secondary" onClick={handleAssignToTeam}>
              Asignar al equipo
            </Button>
          </div>
        </Modal.Body>
      </Modal>

      {/* Modal de liberación */}
      <Modal
        show={showReleaseModal}
        onHide={handleCancelRelease}
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
            ¿Seguro que quieres liberar a {trainerPokemon?.pokemon.name} por{" "}
            {sellPrice}$?
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
          <Button variant="secondary" onClick={handleCancelRelease}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={handleConfirmRelease}>
            Liberar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal de asignación al equipo */}
      <Modal
        show={showAssignToTeamModal}
        onHide={handleCancelAssingToTeam}
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
            ¿Seguro que quieres añadir al equipo a{" "}
            {trainerPokemon?.pokemon.name}?
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
          <Button variant="secondary" onClick={handleCancelAssingToTeam}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={handleConfirmAssignToTeam}>
            Añadir
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal de selección del pokemon a cambiar del team */}
      <Modal
        show={showSelectPokemonFromTeamModal}
        onHide={() => setShowSelectPokemonFromTeamModal(false)}
        size="sm"
        centered
        style={{ textAlign: "center" }}
      >
        <Modal.Body>
          <p>¡Equipo lleno!</p>
          <p>¿Qué pokémon quieres cambiar?</p>
          {team.map((pokemon) => (
            <div key={pokemon.id}>
              <Button
                variant="secondary"
                onClick={() => handleSelectPokemonToSwitch(pokemon)}
                className="button__pokemon-team-to-delete"
              >
                <span>{pokemon.pokemon.name}</span>
              </Button>
            </div>
          ))}
        </Modal.Body>
      </Modal>
    </>
  );
};

export default PokemonInBox;
