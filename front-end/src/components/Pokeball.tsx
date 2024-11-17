import React, { useEffect, useState } from "react";
import { Image, Modal, Button } from "react-bootstrap";
import {
  openPokeball,
  updateNickname,
  getPokeballProbs,
} from "../services/api";
import { useAppDispatch } from "../hooks/redux/hooks";
import { updateBalance } from "../services/auth/authSlice";
import { FaInfoCircle } from "react-icons/fa";

interface PokeballProps {
  imageUrl: string;
  altura: string;
  pokeballType: string;
  userBalance: string | null;
  price: number;
}

interface PokeballInfo {
  [key: string]: { percentage: string; pokemons: string[] };
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
  const [modalInfoOpen, setModalInfoOpen] = useState(false);
  const [animationInProgress, setAnimationInProgress] = useState(false);
  const [currentPokemonImage, setCurrentPokemonImage] = useState("");
  const [openedPokemon, setOpenedPokemon] = useState("");
  const [openedPokemonName, setOpenedPokemonName] = useState("");
  const [openedPokemonImage, setOpenedPokemonImage] = useState("");
  const [modalOpenedOpen, setModalOpenedOpen] = useState(false);
  const [modalNickname, setModalNickname] = useState(false);
  const [nicknameInput, setNicknameInput] = useState("");

  const [pokeballInfo, setPokeballInfo] = useState<PokeballInfo>({});

  useEffect(() => {
    if (animationInProgress) {
      const interval = setInterval(() => {
        const randomIndex = Math.floor(Math.random() * 493) + 1;
        setCurrentPokemonImage(
          "/images/pokedex/" + String(randomIndex).padStart(3, "0") + ".avif"
        );
      }, 150);
      return () => clearInterval(interval);
    }
  }, [animationInProgress]);

  const handleModalInfoOpen = async () => {
    setModalInfoOpen(true);
  };

  const handleModalInfoClose = () => {
    setModalInfoOpen(false);
  };

  const renderPokeballInfo = () => {
    if (!pokeballInfo || Object.keys(pokeballInfo).length === 0) {
      return <p>Cargando información...</p>;
    }
    return (
      <div>
        {Object.entries(pokeballInfo).map(([key, { percentage, pokemons }]) => (
          <div
            key={key}
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "20px",
              marginTop: "20px",
              boxShadow: "0px 0px 5px rgba(0, 0, 0, 0.3)",
            }}
          >
            <div
              style={{
                flex: "1",
                textAlign: "center",
                alignContent: "center",
              }}
            >
              <h5> {percentage}</h5>
            </div>
            <div style={{ flex: "10", display: "flex", flexWrap: "wrap" }}>
              {pokemons.map((pokemon) => (
                <div
                  key={pokemon}
                  style={{
                    marginRight: "10px",
                    marginBottom: "10px",
                    marginTop: "10px",
                  }}
                >
                  <Image
                    src={`/images/pokedex/${String(pokemon).padStart(
                      3,
                      "0"
                    )}.avif`}
                    alt={pokemon}
                    style={{
                      width: "50px",
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const handleNicknameAssignment = async (nickname: string) => {
    await updateNickname(nickname, openedPokemon);
    setModalNickname(false);
    setModalOpenedOpen(false);
    setNicknameInput("");
  };

  const handleOpenAssignNickname = () => {
    setModalOpenedOpen(false);
    setModalNickname(true);
  };

  const handleNicknameAssignmentClose = () => {
    setModalNickname(false);
    setModalOpenedOpen(true);
  };

  const handleModalOpen = async () => {
    if (userBalance && parseInt(userBalance) - price >= 0) {
      setModalOpen(true);
      const pokeballData = await getPokeballProbs(pokeballType);
      if (pokeballData) {
        setPokeballInfo(pokeballData);
      }
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
    } else if (pokeballType === "Greatball") {
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
          ".avif"
      );

      setModalOpen(false);
      setModalOpeningOpen(true);
      setAnimationInProgress(true);

      setTimeout(() => {
        setAnimationInProgress(false);
        setModalOpeningOpen(false);
        setModalOpenedOpen(true);
      }, 5000);
    }
  };

  return (
    <div className="pokeballs-container">
      <Image
        src={imageUrl}
        alt={`Pokeball ${pokeballType}`}
        style={{ height: altura, cursor: "pointer" }}
        onClick={handleModalOpen}
      />

      <Modal show={modalOpen} onHide={handleModalClose} centered>
        <Modal.Header closeButton>
          <Modal.Title className="pokeball__open-title">{`¿Quieres abrir una ${pokeballType}?`}</Modal.Title>
          <div className="info-icon-container" onClick={handleModalInfoOpen}>
            <FaInfoCircle className="info-icon" />
          </div>
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

      <Modal show={modalOpeningOpen} centered>
        <Modal.Body className="pokeball__opening-body">
          <Image
            src={currentPokemonImage}
            alt={`Pokémon`}
            style={{ height: altura }}
          />
        </Modal.Body>
      </Modal>

      <Modal
        animation={false}
        transition={null}
        fade={false}
        show={modalOpenedOpen}
        onHide={handleModalOpenedClose}
        centered
      >
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
            No
          </Button>
          <Button variant="primary" onClick={handleOpenAssignNickname}>
            Sí
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

      <Modal
        show={modalInfoOpen}
        onHide={handleModalInfoClose}
        dialogClassName="custom-modal-big"
      >
        <Modal.Header closeButton>
          <Modal.Title>{`Información de la ${pokeballType}`}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {modalInfoOpen && pokeballInfo ? (
            renderPokeballInfo()
          ) : (
            <p>Cargando información...</p>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Pokeball;
