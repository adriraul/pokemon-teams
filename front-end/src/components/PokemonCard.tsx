import React, { useState } from "react";
import { Pokemon } from "../services/api";
import { Button, Card, Image, Modal } from "react-bootstrap";
import { addPokemonToUser } from "../services/api";
import { useAppSelector } from "../hooks/redux/hooks";
import { RootState } from "../store";
import "./styles/PokemonCard.css";

const PokemonCard: React.FC<{ pokemon: Pokemon; isCaptured: Boolean }> = ({
  pokemon,
  isCaptured,
}) => {
  const [showCaptureModal, setShowCaptureModal] = useState(false);
  const isAuthenticated = useAppSelector(
    (state: RootState) => state.auth.isAuthenticated
  );

  const handleCaptureClick = async () => {
    setShowCaptureModal(true);
  };

  const handleConfirmCapture = async () => {
    try {
      await addPokemonToUser(pokemon.pokedex_id);
    } catch (error) {
      console.error("Error al capturar el Pokémon:", error);
    } finally {
      setShowCaptureModal(false);
    }
  };

  return (
    <div className="col-lg-3 col-md-4 col-sm-6">
      <Card
        className={`mb-3 pokemonCardBackground ${
          !isCaptured ? "blackImage" : ""
        }`}
      >
        <div className="pokemonImageContainer">
          <Image
            draggable={false}
            src={`/images/pokedex/${String(pokemon.pokedex_id).padStart(
              3,
              "0"
            )}.png`}
            alt={pokemon.name}
            className={`card-img-top pokemonImage ${
              !isCaptured ? "captured" : ""
            }`}
          />
        </div>
        <Card.Body>
          <Card.Title className="card-title">
            {`Nº. ${String(pokemon.pokedex_id).padStart(3, "0")}`}
            <span style={{ fontWeight: "bold", marginLeft: "15px" }}>
              {` ${isCaptured ? pokemon.name : `- - - - - - - -`}`}
            </span>
          </Card.Title>
          <div className="d-flex justify-content-between align-items-center mb-2">
            <div className="type-images">
              {pokemon.pokemonTypes.map((type, index) => (
                <React.Fragment key={type.name}>
                  {index > 0 && <span className="ms-2" />}
                  <Image
                    src={`/images/pokemon_types/${
                      isCaptured ? type.name : `Unknown`
                    }.png`}
                    alt={type.name}
                    className="type-image"
                  />
                </React.Fragment>
              ))}
            </div>
          </div>

          <div className="capture-button-container">
            {isAuthenticated && (
              <Button
                variant="link"
                onClick={handleCaptureClick}
                className="p-0 capture-button"
              ></Button>
            )}
          </div>
        </Card.Body>

        <Modal
          show={showCaptureModal}
          onHide={() => setShowCaptureModal(false)}
          style={{ color: "white" }}
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title>Capturar Pokémon</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>¿Estás seguro de que quieres capturar a {pokemon.name}?</p>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => setShowCaptureModal(false)}
            >
              Cancelar
            </Button>
            <Button variant="primary" onClick={handleConfirmCapture}>
              Capturar
            </Button>
          </Modal.Footer>
        </Modal>
      </Card>
    </div>
  );
};

export default PokemonCard;
