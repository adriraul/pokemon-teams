import React, { useEffect, useState } from "react";
import { Image, Modal, Button } from "react-bootstrap";
import {
  openPokeball,
  updateNickname,
  getPokeballProbs,
} from "../services/api";
import { useAppDispatch } from "../hooks/redux/hooks";
import {
  updateBadgesUnlocked,
  updateBalance,
} from "../services/auth/authSlice";
import { FaInfoCircle } from "react-icons/fa";
import "./styles/PokeballAnimations.css";

interface PokeballProps {
  imageUrl: string;
  altura: string;
  pokeballType: string;
  userBalance: string | null;
  price: number;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface OpenPokeballData {
  newBalance: string;
  newPokemonTrainer: {
    id: number;
    pokemon: {
      name: string;
      pokedex_id: number;
      power: number;
    };
  };
  badgesUnlocked: string;
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
  const [openedPokemonPower, setOpenedPokemonPower] = useState(3);
  const [modalOpenedOpen, setModalOpenedOpen] = useState(false);
  const [modalNickname, setModalNickname] = useState(false);
  const [nicknameInput, setNicknameInput] = useState("");

  const [pokeballInfo, setPokeballInfo] = useState<PokeballInfo | null>(null);

  const [pokeballOpening, setPokeballOpening] = useState(false);
  const [showLight, setShowLight] = useState(false);

  const getPokemonRarity = (power: number): "common" | "rare" | "epic" => {
    if (power <= 4) return "common";
    if (power <= 6) return "rare";
    return "epic";
  };

  const getCongratulationsTitle = (power: number): string => {
    const rarity = getPokemonRarity(power);
    switch (rarity) {
      case "common":
        return "Pokémon captured!";
      case "rare":
        return "Rare Pokémon found!";
      case "epic":
        return "EPIC POKÉMON!";
      default:
        return "Pokémon captured!";
    }
  };

  const getCongratulationsClass = (power: number): string => {
    const rarity = getPokemonRarity(power);
    return `congratulations-title-${rarity}`;
  };

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
      return <p>Loading</p>;
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
      dispatch(updateBadgesUnlocked(response.badgesUnlocked));
      const openedPokemon = response.newPokemonTrainer.pokemon;
      setOpenedPokemonName(openedPokemon.name);
      setOpenedPokemon(String(response.newPokemonTrainer.id));
      setOpenedPokemonPower(openedPokemon.power);
      setOpenedPokemonImage(
        "/images/pokedex/" +
          String(openedPokemon.pokedex_id).padStart(3, "0") +
          ".avif"
      );

      setModalOpen(false);
      setModalOpeningOpen(true);
      setAnimationInProgress(true);

      setPokeballOpening(true);
      setShowLight(true);

      setTimeout(() => {
        setShowLight(false);
      }, 1500);

      setTimeout(() => {
        setPokeballOpening(false);
      }, 2000);

      setTimeout(() => {
        setAnimationInProgress(false);
        setModalOpeningOpen(false);
        setModalOpenedOpen(true);
      }, 5000);
    }
  };

  return (
    <div className="pokeballs-container">
      <div className="pokeball-container">
        <Image
          src={imageUrl}
          alt={`Pokeball ${pokeballType}`}
          style={{ height: altura, cursor: "pointer" }}
          onClick={handleModalOpen}
          className={pokeballOpening ? "pokeball-opening" : ""}
        />

        {/* Efecto de luz */}
        {showLight && <div className="pokeball-light" />}
      </div>

      <Modal show={modalOpen} onHide={handleModalClose} centered>
        <Modal.Header closeButton>
          <Modal.Title className="pokeball__open-title">{`Do you want to open a ${pokeballType}?`}</Modal.Title>
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
            {`Remaining balance after the purchase: ${
              parseInt(userBalance) - price
            }$`}
          </Modal.Body>
        ) : (
          <></>
        )}

        <Modal.Footer className="pokeball__open-footer">
          <Button variant="secondary" onClick={handleModalClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleOpenPokeball}>
            Open
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal
        show={modalOpeningOpen}
        centered
        className="pokeball-opening-modal"
      >
        <Modal.Body className="pokeball__opening-body">
          <Image
            src={currentPokemonImage}
            alt={`Pokémon`}
            style={{ height: altura }}
            className="pokemon-reveal"
          />
        </Modal.Body>
      </Modal>

      <Modal
        animation={false}
        transition={null}
        show={modalOpenedOpen}
        onHide={handleModalOpenedClose}
        centered
        className="congratulations-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title className={getCongratulationsClass(openedPokemonPower)}>
            {getCongratulationsTitle(openedPokemonPower)}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="pokeball__opening-body">
          <div className="pokemon-container-epic">
            <Image
              src={openedPokemonImage}
              alt={`Pokémon`}
              style={{ height: altura }}
              className={`pokemon-flash pokemon-flash-${getPokemonRarity(
                openedPokemonPower
              )}`}
            />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Modal.Title>{`You have obtained a ${openedPokemonName}! Would you like to give it a name?`}</Modal.Title>
          <Button
            variant="secondary"
            onClick={handleModalOpenedClose}
            className="pokeball-btn"
          >
            No
          </Button>
          <Button
            variant="primary"
            onClick={handleOpenAssignNickname}
            className="pokeball-btn"
          >
            Yes
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
          <Modal.Title>{`Assign a name for your ${openedPokemonName}`}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <input
            type="text"
            placeholder="Enter a nickname for your Pokemon."
            className="searchInputBackground"
            value={nicknameInput}
            onChange={(e) => setNicknameInput(e.target.value)}
            style={{ width: "100%" }}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleNicknameAssignmentClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={() => handleNicknameAssignment(nicknameInput)}
          >
            Assign
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal
        show={modalInfoOpen}
        onHide={handleModalInfoClose}
        dialogClassName="custom-modal-big"
      >
        <Modal.Header closeButton>
          <Modal.Title>{`What can you get in a${pokeballType}?`}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {modalInfoOpen && pokeballInfo ? (
            renderPokeballInfo()
          ) : (
            <p>Loading</p>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Pokeball;
