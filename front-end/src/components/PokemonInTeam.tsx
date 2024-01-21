import React, { useState } from "react";
import { TrainerPokemon } from "../services/api";
import { ListGroup, Modal, Button } from "react-bootstrap";
import "./styles/TeamStyles.css";

interface PokemonInTeamProps {
  trainerPokemon?: TrainerPokemon;
  rowHeight: string;
  onRelease?: (releasedPokemon: TrainerPokemon | undefined) => void;
}

const PokemonInTeam: React.FC<PokemonInTeamProps> = ({
  trainerPokemon,
  rowHeight,
}) => {
  const [showOptionsModal, setShowOptionsModal] = useState(false);

  const handleOptionsClick = () => {
    setShowOptionsModal(true);
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
        </Modal.Body>
      </Modal>
    </>
  );
};

export default PokemonInTeam;
