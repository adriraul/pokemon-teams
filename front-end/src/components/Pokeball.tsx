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

  const getPokeballColorClass = (): string => {
    switch (pokeballType) {
      case "Pokeball":
        return "pokeball-red";
      case "Greatball":
        return "pokeball-blue";
      case "Ultraball":
        return "pokeball-black-yellow";
      default:
        return "pokeball-red";
    }
  };

  const getPokeballColors = () => {
    switch (pokeballType) {
      case "Pokeball":
        return {
          titleGradient: "linear-gradient(45deg, #ff6b6b, #ee5a52)",
          buttonGradient: "linear-gradient(45deg, #ff6b6b, #ee5a52)",
          iconColor: "#ff6b6b",
        };
      case "Greatball":
        return {
          titleGradient: "linear-gradient(45deg, #4ecdc4, #44a08d)",
          buttonGradient: "linear-gradient(45deg, #4ecdc4, #44a08d)",
          iconColor: "#4ecdc4",
        };
      case "Ultraball":
        return {
          titleGradient: "linear-gradient(45deg, #ffd700, #ff8e53)",
          buttonGradient: "linear-gradient(45deg, #ffd700, #ff8e53)",
          iconColor: "#ffd700",
        };
      default:
        return {
          titleGradient: "linear-gradient(45deg, #ff6b6b, #ee5a52)",
          buttonGradient: "linear-gradient(45deg, #ff6b6b, #ee5a52)",
          iconColor: "#ff6b6b",
        };
    }
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
          <div key={key} className="pokeball-info-item">
            <div className="pokeball-info-percentage">{percentage}</div>
            <div className="pokeball-info-pokemons">
              {pokemons.map((pokemon) => (
                <div key={pokemon} className="pokeball-info-pokemon">
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

      <Modal
        show={modalOpen}
        onHide={handleModalClose}
        centered
        style={{
          backdropFilter: "blur(20px)",
        }}
      >
        <div
          style={{
            boxShadow: `0 0 50px ${
              getPokeballColors().iconColor
            }40, 0 0 100px ${getPokeballColors().iconColor}20`,
            borderRadius: "20px",
            border: `1px solid ${getPokeballColors().iconColor}30`,
            background: `linear-gradient(135deg, rgba(0, 0, 0, 0.9) 0%, rgba(0, 0, 0, 0.8) 100%)`,
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Efecto de brillo superior */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "2px",
              background: `linear-gradient(90deg, transparent, ${
                getPokeballColors().iconColor
              }, transparent)`,
              zIndex: 1,
            }}
          />

          {/* Efecto de brillo en las esquinas */}
          <div
            style={{
              position: "absolute",
              top: "10px",
              left: "10px",
              width: "30px",
              height: "30px",
              background: `radial-gradient(circle, ${
                getPokeballColors().iconColor
              }40, transparent 70%)`,
              zIndex: 1,
            }}
          />
          <div
            style={{
              position: "absolute",
              top: "10px",
              right: "10px",
              width: "30px",
              height: "30px",
              background: `radial-gradient(circle, ${
                getPokeballColors().iconColor
              }40, transparent 70%)`,
              zIndex: 1,
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: "10px",
              left: "10px",
              width: "30px",
              height: "30px",
              background: `radial-gradient(circle, ${
                getPokeballColors().iconColor
              }40, transparent 70%)`,
              zIndex: 1,
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: "10px",
              right: "10px",
              width: "30px",
              height: "30px",
              background: `radial-gradient(circle, ${
                getPokeballColors().iconColor
              }40, transparent 70%)`,
              zIndex: 1,
            }}
          />

          <Modal.Header
            closeButton
            style={{
              borderRadius: "20px 20px 0 0",
              borderBottom: `1px solid ${getPokeballColors().iconColor}20`,
              background: `linear-gradient(135deg, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0.6) 100%)`,
            }}
          >
            <Modal.Title
              className={`pokeball__open-title ${getPokeballColorClass()}`}
              style={{
                background: getPokeballColors().titleGradient,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                color: "transparent",
                fontWeight: "bold",
                fontSize: "1.5em",
                textAlign: "center",
                margin: "0 auto",
                width: "100%",
                textShadow: `0 0 20px ${getPokeballColors().iconColor}60`,
              }}
            >{`Do you want to open a ${pokeballType}?`}</Modal.Title>
            <div className="info-icon-container" onClick={handleModalInfoOpen}>
              <FaInfoCircle
                className="info-icon"
                style={{
                  color: getPokeballColors().iconColor,
                  filter: `drop-shadow(0 0 8px ${
                    getPokeballColors().iconColor
                  }80)`,
                }}
              />
            </div>
          </Modal.Header>
          <Modal.Body
            className={`pokeball__open-body ${getPokeballColorClass()}`}
            style={{
              background: `linear-gradient(135deg, ${
                getPokeballColors().iconColor
              }15 0%, rgba(0, 0, 0, 0.1) 100%)`,
              border: `2px solid ${getPokeballColors().iconColor}40`,
              borderRadius: "15px",
              margin: "1rem",
              boxShadow: `0 10px 30px ${getPokeballColors().iconColor}30`,
              backdropFilter: "blur(10px)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div className="pokeball-confirm-container">
              <div className="pokeball-preview">
                <Image
                  src={imageUrl}
                  alt={`Pokeball ${pokeballType}`}
                  style={{ height: altura }}
                />
              </div>
              {userBalance && (
                <div className={`balance-info ${getPokeballColorClass()}`}>
                  {`Remaining balance after the purchase: ${
                    parseInt(userBalance) - price
                  }$`}
                </div>
              )}
            </div>
          </Modal.Body>

          <Modal.Footer
            className={`pokeball__open-footer ${getPokeballColorClass()}`}
            style={{
              borderTop: `2px solid ${getPokeballColors().iconColor}30`,
              borderRadius: "0 0 20px 20px",
            }}
          >
            <Button variant="secondary" onClick={handleModalClose}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleOpenPokeball}
              style={{
                background: getPokeballColors().buttonGradient,
                borderColor: getPokeballColors().iconColor,
                color: "#fff",
                boxShadow: `0 4px 15px ${getPokeballColors().iconColor}50`,
                transition: "all 0.3s ease",
              }}
            >
              Open
            </Button>
          </Modal.Footer>
        </div>
      </Modal>

      <Modal
        show={modalOpeningOpen}
        centered
        className="pokeball-opening-modal"
      >
        <Modal.Body className="pokeball__opening-body">
          <div className="opening-animation-container">
            <Image
              src={currentPokemonImage}
              alt={`Pokémon`}
              style={{ height: altura }}
              className="pokemon-reveal"
            />
          </div>
        </Modal.Body>
      </Modal>

      <Modal
        show={modalOpenedOpen}
        onHide={handleModalOpenedClose}
        centered
        className="congratulations-modal"
        backdrop="static"
        keyboard={false}
      >
        <Modal.Header>
          <Modal.Title className={getCongratulationsClass(openedPokemonPower)}>
            {getCongratulationsTitle(openedPokemonPower)}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="congratulations-modal-body">
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
        className="nickname-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>{`Assign a name for your ${openedPokemonName}`}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <input
            type="text"
            placeholder="Enter a nickname for your Pokemon."
            className="nickname-input"
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
          <Modal.Title>{`What can you get in a ${pokeballType}?`}</Modal.Title>
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
