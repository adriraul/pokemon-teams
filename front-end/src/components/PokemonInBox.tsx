import React, { useState } from "react";
import { TrainerPokemon } from "../services/api";
import { ListGroup, Modal, Button } from "react-bootstrap";
import { removePokemonFromUser } from "../services/api";

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

  const handleOptionsClick = () => {
    setShowOptionsModal(true);
  };

  const handleRelease = () => {
    setShowOptionsModal(false);
    setShowReleaseModal(true);
  };

  const handleCancelRelease = () => {
    setShowReleaseModal(false);
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
        onClick={handleOptionsClick}
        style={{
          flex: "0 0 16.6667%",
          margin: 0,
          padding: 0,
          position: "relative",
          overflow: "hidden",
          height: rowHeight,
          cursor: "pointer", // Añade esto para indicar que el elemento es clickeable
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
            background: "linear-gradient(to bottom right, #333333, #666666)",
            border: "1px solid #666666",
            borderRadius: "5px",
            padding: "8px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {/* Aquí puedes colocar cualquier contenido adicional o opciones del Pokémon */}
          <Button variant="secondary" onClick={handleRelease}>
            Liberar Pokémon
          </Button>
        </Modal.Body>
      </Modal>

      {/* Modal de liberación */}
      <Modal
        show={showReleaseModal}
        onHide={handleCancelRelease}
        size="sm" // Ajusta el tamaño según tus necesidades
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
    </>
  );
};

export default PokemonInBox;
