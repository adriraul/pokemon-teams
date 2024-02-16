import React, { useState } from "react";
import { TrainerPokemon } from "../services/api";
import { ListGroup, Modal, Button } from "react-bootstrap";
import { sendPokemonToFirstBox } from "../services/api";
import "./styles/TeamStyles.css";

interface PokemonInTeamProps {
  trainerPokemon?: TrainerPokemon;
  rowHeight: string;
  onRelease?: (releasedPokemon: TrainerPokemon | undefined) => void;
}

const PokemonInTeam: React.FC<PokemonInTeamProps> = ({
  trainerPokemon,
  rowHeight,
  onRelease,
}) => {
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [showMoveToBoxModal, setShowMoveToBoxModal] = useState(false);

  const handleOptionsClick = () => {
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
        onRelease && onRelease(trainerPokemon);
      }
    } catch (error) {
      console.error("Error al confirmar asignación al equipo", error);
    }
  };

  return (
    <>
      <ListGroup.Item
        onClick={handleOptionsClick}
        className="pokemon-in-team"
        style={{
          flex: "0 0 16.6667%",
          margin: 0,
          padding: 0,
          position: "relative",
          overflow: "hidden",
          height: rowHeight,
          cursor: "pointer",
          border: "none",
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
          <div>
            <Button variant="secondary" onClick={handleMoveToBoxClick}>
              Enviar a la caja
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
