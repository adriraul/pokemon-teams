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

  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState<"user" | "level" | null>(null);

  const [showAttackOptions, setShowAttackOptions] = useState(false);
  const [showingBattleOptions, setShowingBattleOptions] = useState(true);
  const [isAttacked, setIsAttacked] = useState(false);

  const [currentLogMessage, setCurrentLogMessage] = useState<string>("");
  const [logQueue, setLogQueue] = useState<string[]>([]);
  const [currentDisplayedText, setCurrentDisplayedText] = useState("");
  const [persistentMessage, setPersistentMessage] = useState("");

  const [level, setLevel] = useState<GameLevel | null>(null);

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
            if (levelData.active) {
              const activePokemonIndex = userTeam.trainerPokemons.findIndex(
                (p) => p.activeInGameLevel
              );
              if (activePokemonIndex !== -1) {
                setCurrentPokemonIndex(activePokemonIndex);
              }
            } else {
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
      surrender: false,
    };

    const updatedData = await updatePlay(updatePlayData);

    console.log(updatedData);

    if (updatedData) {
      processBattleResponse(updatedData, level);
    } else {
      console.error("Failed to update game state");
    }
  };

  const processBattleResponse = (data: UpdatedPlayData, level: GameLevel) => {
    setIsAttacked(true);
    setTimeout(() => setIsAttacked(false), 500);
    console.log("--------data processBattleResponse----------");
    console.log(data);
    // Agregar mensajes al log de batalla
    addToBattleLog(`Tu Pokémon usó ${data.attackCaused}`);
    addToBattleLog(data.damageCausedString);
    addToBattleLog(`Tu Pokémon causó ${data.damageCaused} puntos de daño.`);

    addToBattleLog(`El enemigo usó ${data.attackReceived}`);
    addToBattleLog(data.damageReceivedString);
    addToBattleLog(`El enemigo causó ${data.damageReceived} puntos de daño.`);

    // Actualizar el estado del nivel con la nueva información
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
            };
          }
          return gamePokemon;
        }) || [],
      id: level.id, // Asegúrate de que el 'id' nunca sea undefined
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

    if (
      updatedLevel.gameLevelPokemons.length > 0 &&
      updatedLevel.gameLevelPokemons[currentLevelPokemonIndex].ps <= 0
    ) {
      // Comprobar si alguno de los Pokémon ha muerto
      if (updatedLevel.gameLevelPokemons[currentLevelPokemonIndex].ps <= 0) {
        const nextIndex = currentLevelPokemonIndex + 1;
        if (nextIndex < updatedLevel.gameLevelPokemons.length) {
          setCurrentLevelPokemonIndex(nextIndex);
        } else {
          setGameOver(true);
          setWinner("user");
        }
      }

      setLevel(updatedLevel);
      const currentPokemon = userTeam?.trainerPokemons[currentPokemonIndex];
      if (currentPokemon) {
        currentPokemon.ps = data.currentPokemonPs;
        currentPokemon.movements = data.remainingMoves;
      }
    }
  };

  const handleAttackButton = () => {
    setShowAttackOptions(true);
  };

  const handleSwitchPokemon = (index: number) => {
    setCurrentPokemonIndex(index);
    setShowModal(false);
  };

  const handleSurrender = () => {
    setGameOver(true);
    setWinner("level");
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
      {isInitialSelectionOpen && (
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
                >
                  {pokemon.nickname}
                </Button>
              ))}
            </div>
          </Modal.Body>
        </Modal>
      )}
      <h1 className="text-center mb-4">{`Nivel ${level.number}`}</h1>
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
              className={`img-fluid rounded-circle self-pokemon-img
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
                isAttacked ? "attacked-pokemon" : ""
              }`}
              style={{ width: "200px", height: "200px" }}
            />
            {renderEnemyQueue()}
          </Col>
        </Row>
      )}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Elige un Pokémon</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="d-flex flex-wrap justify-content-center">
            {userTeam?.trainerPokemons.map((pokemon, index) => (
              <p
                key={pokemon.id}
                onClick={() => handleSwitchPokemon(index)}
                className="fs-4 cursor-pointer m-2"
              >
                {pokemon.nickname}
              </p>
            ))}
          </div>
        </Modal.Body>
      </Modal>
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
                  onClick={() => setShowModal(true)}
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
