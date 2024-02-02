import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { TrainerPokemon } from "../services/api";
import { ListGroup, Modal, Button } from "react-bootstrap";
import {
  removePokemonFromUser,
  getUserTeams,
  assignPokemonToFirstTeam,
  changeBoxForTeamPokemon,
} from "../services/api";
import "../components/styles/PokemonInBox.css";

interface PokemonInBoxProps {
  trainerPokemon?: TrainerPokemon;
  rowHeight: string;
  onRelease?: (releasedPokemon: TrainerPokemon | undefined) => void;
}

const PokemonInBox: React.FC<PokemonInBoxProps> = ({
  trainerPokemon,
  rowHeight,
  onRelease,
}) => {
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [showReleaseModal, setShowReleaseModal] = useState(false);
  const [showAssignToTeamModal, setShowAssignToTeamModal] = useState(false);
  const [showSelectPokemonFromTeamModal, setShowSelectPokemonFromTeamModal] =
    useState(false);
  const [team, setTeam] = useState<TrainerPokemon[]>([]);
  const navigate = useNavigate();

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
        const currentPokemonsTeam = userTeams[0]?.trainerPokemons;

        if (currentPokemonsTeam.length < 6) {
          await assignPokemonToFirstTeam(trainerPokemon.id);
          setShowAssignToTeamModal(false);
          onRelease && onRelease(trainerPokemon);
        } else {
          setShowAssignToTeamModal(false);
          setTeam(currentPokemonsTeam);
          setShowSelectPokemonFromTeamModal(true);
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
        navigate("/teams");
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
        await removePokemonFromUser(trainerPokemon.id);
        setShowReleaseModal(false);
      } catch (error) {
        console.error("Error al liberar al Pokémon", error);
      }
    }
  };

  const handleConfirmRelease = () => {
    releasePokemon(trainerPokemon);
    onRelease && onRelease(trainerPokemon);
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
              cursor: "pointer",
            }}
            onClick={handleOptionsClick}
          />
        )}
      </ListGroup.Item>

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
          <div style={{ marginBottom: "8px" }}>
            <Button variant="secondary" onClick={handleRelease}>
              Liberar Pokémon
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
            ¿Seguro que quieres liberar a {trainerPokemon?.pokemon.name}?
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
              ).padStart(3, "0")}.png`}
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
              ).padStart(3, "0")}.png`}
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
