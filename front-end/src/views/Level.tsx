import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Container, Row, Col, Button, Modal } from "react-bootstrap";
import {
  GameLevel,
  UpdatePlayData,
  UpdatedPlayData,
  updatePlay,
} from "../services/api";
import useLevelData from "../hooks/useLevelData";
import "./styles/BattleStyles.css";
import { TYPE_MAP } from "../utils/typeMap";

const Level: React.FC = () => {
  const { levelId } = useParams<{ levelId: string }>();
  const {
    userTeam,
    level,
    isInitialSelectionOpen,
    setIsInitialSelectionOpen,
    currentPokemonIndex,
    setCurrentPokemonIndex,
    currentLevelPokemonIndex,
    setCurrentLevelPokemonIndex,
    setLevel,
  } = useLevelData(levelId);

  const [showModalSwitch, setShowModalSwitch] = useState(false);
  const [intentionalSwitch, setIntetionalSwitch] = useState(true);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState<"user" | "level" | null>(null);
  const [showAttackOptions, setShowAttackOptions] = useState(false);
  const [showingBattleOptions, setShowingBattleOptions] = useState(true);
  const [isEnemyAttacked, setIsEnemyAttacked] = useState(false);
  const [isCurrentAttacked, setIsCurrentAttacked] = useState(false);
  const [currentLogMessage, setCurrentLogMessage] = useState<string>("");
  const [logQueue, setLogQueue] = useState<string[]>([]);
  const [currentDisplayedText, setCurrentDisplayedText] = useState("");
  const [persistentMessage, setPersistentMessage] = useState("");

  const [turnStage, setTurnStage] = useState<
    | "idle"
    | "playerAttack"
    | "playerAttackResult"
    | "enemyAttack"
    | "enemyAttackResult"
    | "pokemonFainted"
    | "nextPokemon"
    | "playerPostAttack"
    | "enemyPostAttack"
    | "playerPostAttackResult"
    | "enemyPostAttackResult"
  >("idle");
  const [battleData, setBattleData] = useState<UpdatedPlayData | null>(null);

  //Efect para cargar los mensajes primeros
  useEffect(() => {
    if (logQueue.length > 0 && currentLogMessage === "") {
      setCurrentLogMessage(logQueue[0]);
      setLogQueue((prevQueue) => prevQueue.slice(1));
    }
  }, [logQueue, currentLogMessage]);

  // Este effect maneja el temporizador de visualización de cada mensaje
  useEffect(() => {
    let messageIndex = -1;

    if (currentLogMessage !== "") {
      const timer = setInterval(() => {
        setCurrentDisplayedText(
          (prev) => prev + currentLogMessage[messageIndex]
        );
        messageIndex += 1;
        if (messageIndex === currentLogMessage.length - 1) {
          clearInterval(timer);
          setTimeout(() => {
            setCurrentDisplayedText("");
            setCurrentLogMessage("");
          }, 1500);
        }
      }, 10);

      return () => {
        clearInterval(timer);
      };
    }
  }, [currentLogMessage]);

  useEffect(() => {
    if (showingBattleOptions) {
      const currentPokemon = userTeam?.trainerPokemons[currentPokemonIndex];
      setPersistentMessage(`¿Qué quiere hacer ${currentPokemon?.nickname}?`);
    } else {
      setPersistentMessage("");
    }
  }, [showingBattleOptions, userTeam, currentPokemonIndex]);

  const handleInitialSelection = (index: number) => {
    setCurrentPokemonIndex(index);
    setIsInitialSelectionOpen(false);
  };

  const addToBattleLog = (newMessage: string) => {
    setLogQueue((prevQueue) => [...prevQueue, newMessage]);
  };

  const handleAttack = async (movementUsedTypeId: number) => {
    setShowingBattleOptions(false);
    setShowAttackOptions(false);
    setPersistentMessage("");
    if (!level || !userTeam) return;

    const updatePlayData: UpdatePlayData = {
      gameLevelId: level.id,
      currentPokemonId: userTeam.trainerPokemons[currentPokemonIndex].id,
      movementUsedTypeId: movementUsedTypeId,
      enemyPokemonId: level.gameLevelPokemons[currentLevelPokemonIndex].id,
      pokemonChangedId: 0,
      pokemonChangeDefeatId: 0,
      surrender: false,
    };

    const updatedData = await updatePlay(updatePlayData);
    setBattleData(updatedData);

    if (updatedData) {
      processBattleResponse(updatedData, level, false);
    } else {
      console.error("Failed to update game state");
    }
  };

  const processBattleResponse = (
    data: UpdatedPlayData,
    level: GameLevel,
    change: Boolean,
    newIndex?: number
  ) => {
    console.log("--------data processBattleResponse----------");
    console.log(data);
    setShowingBattleOptions(false);

    if (change) {
      setTurnStage("enemyPostAttack");
    } else if (data.firstAttacker === "team") {
      setTurnStage("playerAttack");
    } else {
      setTurnStage("enemyAttack");
    }

    const updatedLevel = {
      ...level,
      gameLevelPokemons:
        level.gameLevelPokemons.map((gamePokemon, index) => {
          if (index === currentLevelPokemonIndex) {
            return {
              ...gamePokemon,
              ps: data.enemyPokemonPs,
              movements: data.remainingMoves,
            };
          }
          return gamePokemon;
        }) || [],
      id: level.id,
      number: level.number,
      passed: level.passed,
      blocked: level.blocked,
      active: level.active,
    };
    console.log(
      "Updated gamePokemon at index",
      currentLevelPokemonIndex,
      "new ps:",
      updatedLevel.gameLevelPokemons[currentLevelPokemonIndex].ps
    );
    console.log(updatedLevel);

    setLevel(updatedLevel);
    const currentPokemon =
      userTeam?.trainerPokemons[newIndex ? newIndex : currentPokemonIndex];
    if (currentPokemon) {
      currentPokemon.ps = data.currentPokemonPs;
      currentPokemon.movements = data.remainingMoves;
    }
  };

  const playerAttack = (attackTypeName: string) => {
    addToBattleLog(`Tu Pokémon usó ${attackTypeName}`);
    setIsEnemyAttacked(true);
    setTimeout(() => {
      setIsEnemyAttacked(false);
    }, 1500);
  };

  const enemyAttack = (enemyTypeAttack: string) => {
    addToBattleLog(`El enemigo usó ${enemyTypeAttack}`);
    setIsCurrentAttacked(true);
    setTimeout(() => {
      setIsCurrentAttacked(false);
    }, 1500);
  };

  const playerAttackResult = (
    damageCausedString: string,
    damageCaused: number
  ) => {
    addToBattleLog(damageCausedString);
    addToBattleLog(`Tu Pokémon causó ${damageCaused} puntos de daño.`);
  };

  const enemyAttackResult = (
    damageReceivedString: string,
    damageReceived: number
  ) => {
    addToBattleLog(damageReceivedString);
    addToBattleLog(`El enemigo causó ${damageReceived} puntos de daño.`);
  };

  useEffect(() => {
    if (!battleData) return;

    const attackTypeName = TYPE_MAP[battleData.attackCaused];
    const receivedAttackTypeName = TYPE_MAP[battleData.attackReceived];
    console.log("turnStage", turnStage);

    if (turnStage === "playerAttack") {
      playerAttack(attackTypeName);
      setTimeout(() => {
        setTurnStage("playerAttackResult");
      }, 1000);
    }

    if (turnStage === "enemyAttack") {
      enemyAttack(receivedAttackTypeName);
      setTimeout(() => {
        setTurnStage("enemyAttackResult");
      }, 1000);
    }

    if (turnStage === "playerAttackResult") {
      playerAttackResult(
        battleData.damageCausedString,
        battleData.damageCaused
      );
      setTimeout(() => {
        if (battleData.enemyPokemonPs > 0) {
          setTurnStage("enemyPostAttack");
        } else {
          setTurnStage("nextPokemon");
        }
      }, 4500);
    }

    if (turnStage === "enemyAttackResult") {
      enemyAttackResult(
        battleData.damageReceivedString,
        battleData.damageReceived
      );
      setTimeout(() => {
        if (battleData.currentPokemonPs > 0) {
          setTurnStage("playerPostAttack");
        } else {
          setTurnStage("pokemonFainted");
        }
      }, 4500);
    }

    if (turnStage === "playerPostAttack") {
      playerAttack(attackTypeName);
      if (battleData.enemyPokemonPs <= 0) {
        setTurnStage("nextPokemon");
      } else {
        setTurnStage("playerPostAttackResult");
      }
    }

    if (turnStage === "enemyPostAttack") {
      enemyAttack(receivedAttackTypeName);
      if (battleData.enemyPokemonPs <= 0) {
        setTurnStage("pokemonFainted");
      } else {
        setTurnStage("enemyPostAttackResult");
      }
    }

    if (turnStage === "playerPostAttackResult") {
      playerAttackResult(
        battleData.damageCausedString,
        battleData.damageCaused
      );
      setTimeout(() => {
        if (battleData.enemyPokemonPs > 0) {
          setTurnStage("idle");
        } else {
          setTurnStage("nextPokemon");
        }
      }, 1500);
    }

    if (turnStage === "enemyPostAttackResult") {
      enemyAttackResult(
        battleData.damageReceivedString,
        battleData.damageReceived
      );
      setTimeout(() => {
        if (battleData.currentPokemonPs > 0) {
          setTurnStage("idle");
        } else {
          setTurnStage("pokemonFainted");
        }
      }, 5000);
    }

    if (turnStage === "pokemonFainted") {
      addToBattleLog(`Tu Pokémon ha sido debilitado.`);
      setTimeout(() => {
        handleOpenPokemonModal(false);
      }, 1500);
    }

    if (turnStage === "nextPokemon") {
      const nextEnemyIndex = level?.gameLevelPokemons.findIndex(
        (pokemon, index) => index > currentLevelPokemonIndex && pokemon.ps > 0
      );
      if (nextEnemyIndex && nextEnemyIndex !== -1) {
        setCurrentLevelPokemonIndex(nextEnemyIndex);
        addToBattleLog(
          `El Pokémon enemigo ha sido debilitado. Saldrá ${level?.gameLevelPokemons[nextEnemyIndex].pokemon.name}.`
        );
        setTimeout(() => {
          setTurnStage("idle");
        }, 5000);
      } else {
        setGameOver(true);
        setWinner("user");
      }
    }

    if (turnStage === "idle") {
      setShowingBattleOptions(true);
    }
  }, [turnStage]);

  const handleAttackButton = () => {
    setShowAttackOptions(true);
  };

  const handleSwitchPokemon = async (index: number) => {
    if (!level || !userTeam) return;

    const updatePlayData: UpdatePlayData = {
      gameLevelId: level.id,
      currentPokemonId: userTeam.trainerPokemons[currentPokemonIndex].id,
      movementUsedTypeId: 0,
      enemyPokemonId: level.gameLevelPokemons[currentLevelPokemonIndex].id,
      pokemonChangedId: intentionalSwitch
        ? userTeam?.trainerPokemons[index].id
        : 0,
      pokemonChangeDefeatId: intentionalSwitch
        ? 0
        : userTeam?.trainerPokemons[index].id,
      surrender: false,
    };

    setCurrentPokemonIndex(index);
    setShowModalSwitch(false);

    const updatedData = await updatePlay(updatePlayData);
    if (intentionalSwitch) setBattleData(updatedData);

    if (updatedData && intentionalSwitch) {
      processBattleResponse(updatedData, level, intentionalSwitch, index);
    } else {
      console.error("Failed to update game state");
    }
  };

  const handleSurrender = async () => {
    if (!level || !userTeam) return;

    const updatePlayData: UpdatePlayData = {
      gameLevelId: level.id,
      currentPokemonId: 0,
      movementUsedTypeId: 0,
      enemyPokemonId: 0,
      pokemonChangedId: 0,
      pokemonChangeDefeatId: 0,
      surrender: true,
    };

    await updatePlay(updatePlayData);
    setGameOver(true);
    setWinner("level");
  };

  const handleOpenPokemonModal = (intentionalSwitch: boolean) => {
    setIntetionalSwitch(intentionalSwitch);
    setShowModalSwitch(true);
  };

  const renderAttackOptions = () => {
    if (!userTeam) return null;
    const currentPokemon = userTeam.trainerPokemons[currentPokemonIndex];
    return currentPokemon.movements.map((movement) => (
      <Button
        key={movement.id}
        className={`attack-button button-${movement.pokemonType.name.toLowerCase()}`}
        onClick={() => handleAttack(movement.pokemonType.id)}
        disabled={movement.quantity === 0}
      >
        {movement.pokemonType.name} ({movement.quantity})
      </Button>
    ));
  };

  const renderEnemyQueue = () => {
    if (!level) return null;

    return (
      <Row className="mt-4 justify-content-center">
        {level.gameLevelPokemons.map((pokemon, index) => {
          if (index !== currentLevelPokemonIndex) {
            return (
              <Col
                key={pokemon.pokemon.pokedex_id}
                xs={4}
                sm={2}
                className="mb-2"
              >
                <img
                  src={`/images/pokedex/${String(
                    pokemon.pokemon.pokedex_id
                  ).padStart(3, "0")}.png`}
                  alt={pokemon.pokemon.name}
                  style={{
                    width: "100%",
                    filter: pokemon.ps <= 0 ? "grayscale(1)" : "none",
                    borderRadius: "50%",
                  }}
                />
              </Col>
            );
          }
          return null;
        })}
      </Row>
    );
  };

  const renderTeamQueue = () => {
    if (!level) return null;

    return (
      <Row className="mt-4 justify-content-center">
        {userTeam?.trainerPokemons.map((pokemon, index) => {
          if (index !== currentPokemonIndex) {
            return (
              <Col
                key={pokemon.pokemon.pokedex_id}
                xs={4}
                sm={2}
                className="mb-2"
              >
                <img
                  src={`/images/pokedex/${String(
                    pokemon.pokemon.pokedex_id
                  ).padStart(3, "0")}.png`}
                  alt={pokemon.pokemon.name}
                  style={{
                    width: "100%",
                    filter: pokemon.ps <= 0 ? "grayscale(1)" : "none",
                    borderRadius: "50%",
                  }}
                />
              </Col>
            );
          }
          return null;
        })}
      </Row>
    );
  };

  const renderInitialPokemonSelectionModal = () => {
    return (
      <Modal show={isInitialSelectionOpen} centered>
        <Modal.Header>
          <Modal.Title>Selecciona tu Pokémon inicial</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="d-flex flex-wrap justify-content-center">
            {userTeam?.trainerPokemons.map((pokemon, index) => (
              <Button
                key={pokemon.id}
                onClick={() => handleInitialSelection(index)}
                className="m-2 btn-lg"
                disabled={pokemon.ps <= 0} // Deshabilitar si el Pokémon está debilitado
              >
                <img
                  src={`/images/pokedex/${String(
                    pokemon.pokemon.pokedex_id
                  ).padStart(3, "0")}.png`}
                  alt={pokemon.nickname}
                  style={{
                    width: "100px",
                    height: "100px",
                    filter: pokemon.ps <= 0 ? "grayscale(100%)" : "none",
                  }}
                />
                {pokemon.nickname}
              </Button>
            ))}
          </div>
        </Modal.Body>
      </Modal>
    );
  };

  const renderSwitchPokemonModal = () => {
    if (!userTeam) return null;

    return (
      <Modal
        show={showModalSwitch}
        onHide={() => setShowModalSwitch(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Elige un Pokémon</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="d-flex flex-wrap justify-content-center">
            {userTeam.trainerPokemons.map((pokemon, index) => (
              <div key={pokemon.id} className="p-2">
                <img
                  src={`/images/pokedex/${String(
                    pokemon.pokemon.pokedex_id
                  ).padStart(3, "0")}.png`}
                  alt={pokemon.nickname}
                  style={{
                    width: "100px",
                    height: "100px",
                    filter: pokemon.ps <= 0 ? "grayscale(100%)" : "none",
                    cursor: pokemon.ps > 0 ? "pointer" : "not-allowed",
                    borderRadius: "50%",
                  }}
                  onClick={() => pokemon.ps > 0 && handleSwitchPokemon(index)}
                  className="img-thumbnail"
                />
                <p
                  className={`text-center ${
                    pokemon.ps <= 0 ? "text-muted" : ""
                  }`}
                >
                  {pokemon.nickname}
                </p>
              </div>
            ))}
          </div>
        </Modal.Body>
      </Modal>
    );
  };

  if (!level) {
    return <div>Cargando...</div>;
  }

  return (
    <Container
      fluid
      style={{
        backgroundColor: "#343a40",
        color: "white",
        minHeight: "100vh",
        padding: "20px",
      }}
    >
      {isInitialSelectionOpen && renderInitialPokemonSelectionModal()}
      <h1 className="text-center mb-4">{`Nivel ${level.number}`}</h1>
      {showModalSwitch && renderSwitchPokemonModal()}
      {gameOver ? (
        <div className="text-center fs-1">
          {winner === "user" ? "¡Has ganado!" : "Has perdido."}
        </div>
      ) : (
        <Row className="align-items-center">
          <Col md={6} className="text-center">
            <h2>{userTeam?.trainerPokemons[currentPokemonIndex].nickname}</h2>
            <div className={`${isEnemyAttacked ? "attack-animation" : ""}`}>
              <img
                src={`/images/pokedex/${String(
                  userTeam?.trainerPokemons[currentPokemonIndex].pokemon
                    .pokedex_id
                ).padStart(3, "0")}.png`}
                alt={`Pokémon ${userTeam?.trainerPokemons[currentPokemonIndex].pokemon.name}`}
                className={`img-fluid rounded-circle self-pokemon-img ${
                  isCurrentAttacked ? "attacked-pokemon" : ""
                }
              }`}
                style={{
                  width: "200px",
                  height: "200px",
                }}
              />
            </div>
            {renderTeamQueue()}
          </Col>
          <Col md={6} className="text-center">
            <h2>
              {level.gameLevelPokemons[currentLevelPokemonIndex].pokemon.name}
            </h2>
            <div
              className={`${isCurrentAttacked ? "enemy-attack-animation" : ""}`}
            >
              <img
                src={`/images/pokedex/${String(
                  level.gameLevelPokemons[currentLevelPokemonIndex].pokemon
                    .pokedex_id
                ).padStart(3, "0")}.png`}
                alt={`Pokémon ${level.gameLevelPokemons[currentLevelPokemonIndex].pokemon.name}`}
                className={`img-fluid rounded-circle pokemon-img ${
                  isEnemyAttacked ? "attacked-pokemon" : ""
                }`}
                style={{ width: "200px", height: "200px" }}
              />
            </div>
            {renderEnemyQueue()}
          </Col>
        </Row>
      )}
      <Row className="mt-5 log-options">
        <Col md={8} className="battle-log">
          {currentDisplayedText !== "" ? (
            <p className="text-center battle-message">{currentDisplayedText}</p>
          ) : (
            persistentMessage !== "" && (
              <p className="text-center battle-message">{persistentMessage}</p>
            )
          )}
        </Col>
        <Col md={4} className="battle-options">
          {showingBattleOptions && (
            <>
              <div>
                {showAttackOptions ? (
                  renderAttackOptions()
                ) : (
                  <Button
                    onClick={handleAttackButton}
                    className="button-attack"
                  >
                    Atacar
                  </Button>
                )}
              </div>
              <div>
                <Button
                  onClick={() => handleOpenPokemonModal(true)}
                  className="button-switch mt-3"
                >
                  Pokémon
                </Button>
                <Button
                  onClick={handleSurrender}
                  className="button-surrender mt-3"
                >
                  Rendirse
                </Button>
              </div>
            </>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default Level;
