import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Container, Row, Col, Button, Modal } from "react-bootstrap";
import { useDispatch } from "react-redux";
import { setIsLoading } from "../services/auth/authSlice";
import {
  GameLevel,
  TeamData,
  UpdatePlayData,
  UpdatedPlayData,
} from "../services/api";
import { getUserTeams, getUserGameLevel, updatePlay } from "../services/api";
import "./styles/BattleStyles.css";

const Level: React.FC = () => {
  const dispatch = useDispatch();
  const { levelId } = useParams<{ levelId: string }>();

  const [isInitialSelectionOpen, setIsInitialSelectionOpen] = useState(false);

  const [userTeam, setUserTeam] = useState<TeamData | null>(null);
  const [currentPokemonIndex, setCurrentPokemonIndex] = useState(0);
  const [currentLevelPokemonIndex, setCurrentLevelPokemonIndex] = useState(0);
  const [showModal, setShowModal] = useState(false);
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

  const [level, setLevel] = useState<GameLevel | null>(null);

  type TypeMap = {
    [key: number]: string;
  };

  const TYPE_MAP: TypeMap = {
    1: "webo",
    2: "los guantes",
    3: "Flying",
    4: "venenux",
    5: "arena",
    6: "rocarda",
    7: "saltamontes",
    8: "fantasmito",
    9: "acero puro",
    10: "mecheros",
    11: "grifo",
    12: "hierba",
    13: "electrocutación",
    14: "psicoataque",
    15: "heladitos",
    16: "dragon",
    17: "oscuridad",
    18: "fairy",
  };

  useEffect(() => {
    const fetchUserTeams = async () => {
      dispatch(setIsLoading(true));
      try {
        const teamsData = await getUserTeams();
        if (teamsData) {
          setUserTeam(teamsData[0]);
        }
      } catch (error) {
        console.error("Error loading team data:", error);
      } finally {
        dispatch(setIsLoading(false));
      }
    };
    fetchUserTeams();
  }, [dispatch]);

  useEffect(() => {
    const fetchLevelData = async () => {
      if (levelId && userTeam) {
        dispatch(setIsLoading(true));
        try {
          const levelData = await getUserGameLevel(levelId);
          if (levelData) {
            setLevel(levelData);
            const activePokemonIndex = userTeam.trainerPokemons.findIndex(
              (p) => p.activeInGameLevel
            );
            const activeEnemyIndex = levelData.gameLevelPokemons.findIndex(
              (p) => p.ps > 0
            );

            // Establecer el índice del Pokémon enemigo activo
            if (activeEnemyIndex !== -1) {
              setCurrentLevelPokemonIndex(activeEnemyIndex);
            }

            if (levelData.active) {
              if (activePokemonIndex !== -1) {
                // Hay un Pokémon activo, así que lo establecemos
                setCurrentPokemonIndex(activePokemonIndex);
              } else {
                // No hay un Pokémon activo, forzar selección
                setIsInitialSelectionOpen(true);
              }
            } else {
              // El nivel no está activo, abrir la selección inicial
              setIsInitialSelectionOpen(true);
            }
          }
        } catch (error) {
          console.error("Error loading level data:", error);
        } finally {
          dispatch(setIsLoading(false));
        }
      }
    };
    fetchLevelData();
  }, [dispatch, levelId, userTeam]);

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
          }, 3000);
        }
      }, 25);

      return () => {
        clearInterval(timer);
      };
    }
  }, [currentLogMessage]);

  //para mostrar de nuevo las battle options
  useEffect(() => {
    if (currentLogMessage === "" && logQueue.length === 0) {
      setShowingBattleOptions(true);
    }
  }, [currentLogMessage, logQueue]);

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

    console.log(updatedData);

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
    console.log(currentPokemonIndex);

    const attackTypeName = TYPE_MAP[data.attackCaused];
    const receivedAttackTypeName = TYPE_MAP[data.attackReceived];

    if (data.firstAttacker === "team" && !change) {
      addToBattleLog(`Tu Pokémon usó ${attackTypeName}`);
      addToBattleLog(data.damageCausedString);
      addToBattleLog(`Tu Pokémon causó ${data.damageCaused} puntos de daño.`);
      setIsEnemyAttacked(true);
      setTimeout(() => setIsEnemyAttacked(false), 500);

      if (data.enemyPokemonPs > 0) {
        addToBattleLog(`El enemigo usó ${receivedAttackTypeName}`);
        addToBattleLog(data.damageReceivedString);
        addToBattleLog(
          `El enemigo causó ${data.damageReceived} puntos de daño.`
        );
        setIsCurrentAttacked(true);
        setTimeout(() => setIsCurrentAttacked(false), 500);
      }
    } else {
      addToBattleLog(`El enemigo usó ${receivedAttackTypeName}`);
      addToBattleLog(data.damageReceivedString);
      addToBattleLog(`El enemigo causó ${data.damageReceived} puntos de daño.`);
      setIsCurrentAttacked(true);
      setTimeout(() => setIsCurrentAttacked(false), 500);

      if (data.currentPokemonPs > 0 && !change) {
        addToBattleLog(`Tu Pokémon usó ${attackTypeName}`);
        addToBattleLog(data.damageCausedString);
        addToBattleLog(`Tu Pokémon causó ${data.damageCaused} puntos de daño.`);
        setIsEnemyAttacked(true);
        setTimeout(() => setIsEnemyAttacked(false), 500);
      }
    }

    const updatedLevel = {
      ...level,
      gameLevelPokemons:
        level.gameLevelPokemons.map((gamePokemon, index) => {
          if (index === currentLevelPokemonIndex) {
            console.log(
              "Updating ps for index",
              currentLevelPokemonIndex,
              "with",
              data.enemyPokemonPs
            );
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
    console.log("LLEGO AQUÍ?");
    console.log(
      "Updated gamePokemon at index",
      currentLevelPokemonIndex,
      "new ps:",
      updatedLevel.gameLevelPokemons[currentLevelPokemonIndex].ps
    );
    console.log(updatedLevel);

    if (data.enemyPokemonPs <= 0) {
      const nextEnemyIndex = updatedLevel.gameLevelPokemons.findIndex(
        (pokemon, index) => index > currentLevelPokemonIndex && pokemon.ps > 0
      );
      if (nextEnemyIndex !== -1) {
        setCurrentLevelPokemonIndex(nextEnemyIndex);
        addToBattleLog(
          `El Pokémon enemigo ha sido debilitado. Saldrá ${updatedLevel.gameLevelPokemons[nextEnemyIndex].pokemon.name}.`
        );
      } else {
        setGameOver(true);
        setWinner("user");
      }
    }

    if (data.currentPokemonPs <= 0) {
      addToBattleLog(
        `Tu Pokémon ${
          userTeam?.trainerPokemons[newIndex ? newIndex : currentPokemonIndex]
            .nickname
        } ha sido debilitado.`
      );
      handleOpenPokemonModal(false);
    }

    setLevel(updatedLevel);
    const currentPokemon =
      userTeam?.trainerPokemons[newIndex ? newIndex : currentPokemonIndex];
    if (currentPokemon) {
      currentPokemon.ps = data.currentPokemonPs;
      currentPokemon.movements = data.remainingMoves;
    }
  };

  const handleAttackButton = () => {
    setShowAttackOptions(true);
  };

  const handleSwitchPokemon = async (index: number) => {
    setPersistentMessage("");
    if (!level || !userTeam) return;
    console.log("index clicado");
    console.log(index);

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
    setShowModal(false);

    const updatedData = await updatePlay(updatePlayData);
    console.log("updated data");
    console.log(updatedData);

    if (updatedData && intentionalSwitch) {
      processBattleResponse(updatedData, level, true, index);
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
    setShowModal(true);
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
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
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
      {showModal && renderSwitchPokemonModal()}
      {gameOver ? (
        <div className="text-center fs-1">
          {winner === "user" ? "¡Has ganado!" : "Has perdido."}
        </div>
      ) : (
        <Row className="align-items-center">
          <Col md={6} className="text-center">
            <h2>{userTeam?.trainerPokemons[currentPokemonIndex].nickname}</h2>
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
            {renderTeamQueue()}
          </Col>
          <Col md={6} className="text-center">
            <h2>
              {level.gameLevelPokemons[currentLevelPokemonIndex].pokemon.name}
            </h2>
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
