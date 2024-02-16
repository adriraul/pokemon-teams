import React, { useEffect, useState } from "react";
import { Image, Modal, Button } from "react-bootstrap";
import { openPokeball, updateNickname } from "../services/api";
import { useAppDispatch } from "../hooks/redux/hooks";
import { updateBalance } from "../services/auth/authSlice";

interface PokeballProps {
  imageUrl: string;
  altura: string;
  pokeballType: string;
  userBalance: string | null;
  price: number;
}

const Pokeball: React.FC<PokeballProps> = ({
  imageUrl,
  altura,
  pokeballType,
  userBalance,
  price,
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const dispatch = useAppDispatch();

  const [modalOpeningOpen, setModalOpeningOpen] = useState(false);
  const [animationInProgress, setAnimationInProgress] = useState(false);
  const [currentPokemonImage, setCurrentPokemonImage] = useState("");
  const [openedPokemon, setOpenedPokemon] = useState("");
  const [openedPokemonName, setOpenedPokemonName] = useState("");
  const [openedPokemonImage, setOpenedPokemonImage] = useState("");
  const [modalOpenedOpen, setModalOpenedOpen] = useState(false);
  const [modalNickname, setModalNickname] = useState(false);
  const [nicknameInput, setNicknameInput] = useState("");

  useEffect(() => {
    if (animationInProgress) {
      const interval = setInterval(() => {
        const randomIndex = Math.floor(Math.random() * 150) + 1;
        setCurrentPokemonImage(
          "/images/pokedex/" + String(randomIndex).padStart(3, "0") + ".png"
        );
      }, 150);
      return () => clearInterval(interval);
    }
  }, [animationInProgress]);

  const handleNicknameAssignment = async (nickname: string) => {
    await updateNickname(nickname, openedPokemon);
    setModalNickname(false);
    setModalOpenedOpen(false);
    setNicknameInput("");
  };

  const handleModalOpeningClose = () => {
    setModalOpeningOpen(false);
    setAnimationInProgress(false);
    setCurrentPokemonImage("");
  };

  const handleOpenAssignNickname = () => {
    setModalOpenedOpen(false);
    setModalNickname(true);
  };

  const handleNicknameAssignmentClose = () => {
    setModalNickname(false);
    setModalOpenedOpen(true);
  };

  const handleModalOpen = () => {
    if (userBalance && parseInt(userBalance) - price >= 0) {
      setModalOpen(true);
    }
  };

  const handleModalClose = () => {
    setModalOpen(false);
  };

  const handleModalOpenedClose = () => {
    setModalOpenedOpen(false);
  };

  const handleOpenPokeball = async () => {
    let pokeballTypeToBack = "";
    if (pokeballType === "Pokeball") {
      pokeballTypeToBack = "Pokeball";
    } else if (pokeballType === "Superball") {
      pokeballTypeToBack = "Greatball";
    } else if (pokeballType === "Ultraball") {
      pokeballTypeToBack = "Ultraball";
    }

    const response = await openPokeball(pokeballTypeToBack);
    if (response) {
      dispatch(updateBalance(response.newBalance));
      const openedPokemon = response.newPokemonTrainer.pokemon;
      setOpenedPokemonName(openedPokemon.name);
      setOpenedPokemon(String(response.newPokemonTrainer.id));
      setOpenedPokemonImage(
        "/images/pokedex/" +
          String(openedPokemon.pokedex_id).padStart(3, "0") +
          ".png"
      );
    }
    setModalOpen(false);
    setModalOpeningOpen(true);
    setAnimationInProgress(true);

    setTimeout(() => {
      setAnimationInProgress(false);
      setModalOpeningOpen(false);
      setModalOpenedOpen(true);
    }, 5000);
  };

  return (
    <div>
      <Image
        src={imageUrl}
        alt={`Pokeball ${pokeballType}`}
        style={{ height: altura, cursor: "pointer" }}
        onClick={handleModalOpen}
      />

      <Modal show={modalOpen} onHide={handleModalClose} centered>
        <Modal.Header closeButton>
          <Modal.Title className="pokeball__open-title">{`¿Quieres abrir una ${pokeballType}?`}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="pokeball__open-body">
          <Image
            src={imageUrl}
            alt={`Pokeball ${pokeballType}`}
            style={{ height: altura }}
          />
        </Modal.Body>

        {userBalance ? (
          <Modal.Body className="pokeball__open-body">
            {" "}
            {`Balance restante después de la compra: ${
              parseInt(userBalance) - price
            }$`}
          </Modal.Body>
        ) : (
          <></>
        )}

        <Modal.Footer className="pokeball__open-footer">
          <Button variant="secondary" onClick={handleModalClose}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleOpenPokeball}>
            Abrir
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={modalOpeningOpen} onHide={handleModalOpeningClose} centered>
        <Modal.Body className="pokeball__opening-body">
          <Image
            src={currentPokemonImage}
            alt={`Pokémon`}
            style={{ height: altura }}
          />
        </Modal.Body>
      </Modal>

      <Modal show={modalOpenedOpen} onHide={handleModalOpenedClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>¡Enhorabuena!</Modal.Title>
        </Modal.Header>
        <Modal.Body className="pokeball__opening-body">
          <Image
            src={openedPokemonImage}
            alt={`Pokémon`}
            style={{ height: altura }}
          />
        </Modal.Body>
        <Modal.Footer>
          <Modal.Title>{`¡Has conseguido un ${openedPokemonName}! ¿Quieres asignarle un nombre?`}</Modal.Title>
          <Button variant="secondary" onClick={handleModalOpenedClose}>
            Cerrar
          </Button>
          <Button variant="primary" onClick={handleOpenAssignNickname}>
            Asignar nombre
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal
        show={modalNickname}
        onHide={handleNicknameAssignmentClose}
        centered
        small
      >
        <Modal.Header closeButton>
          <Modal.Title>{`Asigna un nombre para tu ${openedPokemonName}`}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <input
            type="text"
            placeholder="Ingresa un mote para tu Pokemon"
            className="searchInputBackground"
            value={nicknameInput}
            onChange={(e) => setNicknameInput(e.target.value)}
            style={{ width: "100%" }}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleNicknameAssignmentClose}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={() => handleNicknameAssignment(nicknameInput)}
          >
            Asignar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Pokeball;
