import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import { useParams } from "react-router-dom";
import { Container, Row, Col, Button, Modal } from "react-bootstrap";
import {
  GameLevel,
  UpdatePlayData,
  UpdatedPlayData,
  updatePlay,
  claimGameLevelReward,
  unlockNextGameLevel,
} from "../services/api";
import useLevelData from "../hooks/useLevelData";
import useBattleLog from "../hooks/useBattleLog";
import "./styles/BattleStyles.css";
import { TYPE_MAP } from "../utils/typeMap";
import HealthBar from "../components/HealthBar";
import { useAppDispatch, useAppSelector } from "../hooks/redux/hooks";
import { updateBalance } from "../services/auth/authSlice";
import Loader from "../components/Loader";

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

  const dispatch = useAppDispatch();
  const isLoading = useAppSelector((state) => state.auth.isLoading);
  const [isClaimed, setIsClaimed] = useState(false);

  const [hasCheckedEnemies, setHasCheckedEnemies] = useState(false);
  const [isUserTeamInitialized, setIsUserTeamInitialized] = useState(false);
  const [isLevelInitialized, setIsLevelInitialized] = useState(false);

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

  const [userPokemonHP, setUserPokemonHP] = useState({
    current: 100,
    max: 100,
  });

  const [enemyPokemonHP, setEnemyPokemonHP] = useState({
    current: 100,
    max: 100,
  });

  useEffect(() => {
    if (userTeam && !isUserTeamInitialized) {
      setUserPokemonHP({
        current: userTeam.trainerPokemons[currentPokemonIndex].ps,
        max: userTeam.trainerPokemons[currentPokemonIndex].pokemon.ps,
      });
      setIsUserTeamInitialized(true);
    }
  }, [userTeam, currentPokemonIndex, isUserTeamInitialized]);

  useEffect(() => {
    if (level && !isLevelInitialized) {
      setEnemyPokemonHP({
        current: level.gameLevelPokemons[currentLevelPokemonIndex].ps,
        max: level.gameLevelPokemons[currentLevelPokemonIndex].pokemon.ps,
      });
      setIsLevelInitialized(true);
    }
  }, [level, currentLevelPokemonIndex, isLevelInitialized]);

  useEffect(() => {
    if (logQueue.length > 0 && currentLogMessage === "") {
      setCurrentLogMessage(logQueue[0]);
      setLogQueue((prevQueue) => prevQueue.slice(1));
    }
  }, [logQueue, currentLogMessage]);

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

  useEffect(() => {
    if (level && !hasCheckedEnemies) {
      const allEnemiesDead = level.gameLevelPokemons.every(
        (pokemon) => pokemon.ps <= 0
      );
      if (allEnemiesDead) {
        setGameOver(true);
        setWinner("user");
      }
      setHasCheckedEnemies(true);
    }
  }, [level, hasCheckedEnemies]);

  const handleInitialSelection = (index: number) => {
    setCurrentPokemonIndex(index);
    setIsInitialSelectionOpen(false);
    if (userTeam) {
      setUserPokemonHP({
        current: userTeam.trainerPokemons[index].ps,
        max: userTeam.trainerPokemons[index].pokemon.ps,
      });
    }
  };

  const addToBattleLog = useCallback((newMessage: string) => {
    setLogQueue((prevQueue) => [...prevQueue, newMessage]);
  }, []);

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
    if (!level || !userTeam) return null;
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

    setLevel(updatedLevel);
    const currentPokemon =
      userTeam.trainerPokemons[newIndex ? newIndex : currentPokemonIndex];
    if (currentPokemon) {
      currentPokemon.ps = data.currentPokemonPs;
      currentPokemon.movements = data.remainingMoves;
    }
  };

  const playerAttack = useCallback(
    (attackTypeName: string) => {
      addToBattleLog(`Tu Pokémon usó ${attackTypeName}`);
      setIsEnemyAttacked(true);
      setTimeout(() => {
        setIsEnemyAttacked(false);
      }, 1500);
    },
    [addToBattleLog]
  );

  const enemyAttack = useCallback(
    (enemyTypeAttack: string) => {
      addToBattleLog(`El enemigo usó ${enemyTypeAttack}`);
      setIsCurrentAttacked(true);
      setTimeout(() => {
        setIsCurrentAttacked(false);
      }, 1500);
    },
    [addToBattleLog]
  );

  const playerAttackResult = useCallback(
    (damageCausedString: string, damageCaused: number) => {
      addToBattleLog(damageCausedString);
      addToBattleLog(`Tu Pokémon causó ${damageCaused} puntos de daño.`);
      setEnemyPokemonHP((prev) => ({
        ...prev,
        current: Math.max(prev.current - damageCaused, 0),
      }));
    },
    [addToBattleLog]
  );

  const enemyAttackResult = useCallback(
    (damageReceivedString: string, damageReceived: number) => {
      addToBattleLog(damageReceivedString);
      addToBattleLog(`El enemigo causó ${damageReceived} puntos de daño.`);
      setUserPokemonHP((prev) => ({
        ...prev,
        current: Math.max(prev.current - damageReceived, 0),
      }));
    },
    [addToBattleLog]
  );

  useEffect(() => {
    if (!battleData || !level) return;

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
      setTimeout(() => {
        if (battleData.enemyPokemonPs <= 0) {
          setTurnStage("nextPokemon");
        } else {
          setTurnStage("playerPostAttackResult");
        }
      }, 500);
    }

    if (turnStage === "enemyPostAttack") {
      enemyAttack(receivedAttackTypeName);
      setTimeout(() => {
        if (battleData.enemyPokemonPs <= 0) {
          setTurnStage("pokemonFainted");
        } else {
          setTurnStage("enemyPostAttackResult");
        }
      }, 500);
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
      }, 5000);
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
        addToBattleLog(
          `El Pokémon enemigo ha sido debilitado. Saldrá ${level?.gameLevelPokemons[nextEnemyIndex].pokemon.name}.`
        );

        setCurrentLevelPokemonIndex(nextEnemyIndex);
        setEnemyPokemonHP({
          current: level?.gameLevelPokemons[nextEnemyIndex].ps,
          max: level?.gameLevelPokemons[nextEnemyIndex].pokemon.ps,
        });
        setTurnStage("idle");
      } else {
        handleUnlockNextLevel();
        setGameOver(true);
        setWinner("user");
      }
    }

    if (turnStage === "idle") {
      setShowingBattleOptions(true);
    }
  }, [
    battleData,
    currentLevelPokemonIndex,
    enemyAttack,
    enemyAttackResult,
    level,
    level?.gameLevelPokemons,
    playerAttack,
    playerAttackResult,
    setCurrentLevelPokemonIndex,
    addToBattleLog,
    turnStage,
  ]);

  const handleUnlockNextLevel = async () => {
    const response = await unlockNextGameLevel();
    if (response) {
      toast.success(`Next level ${response.nextGameLevel.number} unlocked!`);
    }
  };

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
        ? userTeam.trainerPokemons[index].id
        : 0,
      pokemonChangeDefeatId: intentionalSwitch
        ? 0
        : userTeam.trainerPokemons[index].id,
      surrender: false,
    };

    setCurrentPokemonIndex(index);
    setShowModalSwitch(false);

    const updatedData = await updatePlay(updatePlayData);

    if (intentionalSwitch) {
      setBattleData(updatedData);
    }

    setUserPokemonHP({
      current: userTeam.trainerPokemons[index].ps,
      max: userTeam.trainerPokemons[index].pokemon.ps,
    });

    if (updatedData && intentionalSwitch) {
      processBattleResponse(updatedData, level, intentionalSwitch, index);
    } else {
      setTurnStage("idle");
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

  const handleClaimReward = async () => {
    if (!level) return;

    try {
      const response = await claimGameLevelReward(level.id);
      if (response) {
        toast.success(`Reward claimed: ${level.reward} coins.`);
        dispatch(updateBalance(response.newBalance));
        setIsClaimed(true);
      }
    } catch (error) {
      console.error("Error claiming reward:", error);
    }
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
    if (!level || !userTeam) return null;

    return (
      <Row className="mt-4 justify-content-center">
        {userTeam.trainerPokemons.map((pokemon, index) => {
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
    if (!level || !userTeam) return null;
    return (
      <Modal show={isInitialSelectionOpen} centered>
        <Modal.Header>
          <Modal.Title>Selecciona tu Pokémon inicial</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="d-flex flex-wrap justify-content-center">
            {userTeam.trainerPokemons.map((pokemon, index) => (
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
    if (!level || !userTeam) return null;
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

  if (isLoading || !level || !userTeam || !userPokemonHP || !enemyPokemonHP) {
    return <Loader />;
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
      {isInitialSelectionOpen &&
        !level.passed &&
        level.active &&
        renderInitialPokemonSelectionModal()}
      <h1 className="text-center mb-4">{`Nivel ${level.number}`}</h1>
      {showModalSwitch && renderSwitchPokemonModal()}
      {gameOver ? (
        <div className="text-center fs-1">
          {winner === "user" ? (
            <>
              <div>¡Has ganado!</div>
              <Button
                className="mt-3"
                onClick={handleClaimReward}
                disabled={isClaimed}
              >
                {isClaimed ? "Reward Claimed" : "Claim Reward"}
              </Button>
            </>
          ) : (
            "Has perdido."
          )}
        </div>
      ) : (
        <Row className="align-items-center">
          <Col md={6} className="text-center">
            <div className={`${isEnemyAttacked ? "attack-animation" : ""}`}>
              <img
                src={`/images/pokedex/${String(
                  userTeam.trainerPokemons[currentPokemonIndex].pokemon
                    .pokedex_id
                ).padStart(3, "0")}.png`}
                alt={`Pokémon ${userTeam.trainerPokemons[currentPokemonIndex].pokemon.name}`}
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
            <HealthBar
              nickname={userTeam.trainerPokemons[currentPokemonIndex].nickname}
              level={
                userTeam.trainerPokemons[currentPokemonIndex].pokemon.power
              }
              currentHP={userPokemonHP.current}
              maxHP={userPokemonHP.max}
            />
            {renderTeamQueue()}
          </Col>
          <Col md={6} className="text-center">
            <HealthBar
              nickname={
                level.gameLevelPokemons[currentLevelPokemonIndex].pokemon.name
              }
              level={
                level.gameLevelPokemons[currentLevelPokemonIndex].pokemon.power
              }
              currentHP={enemyPokemonHP.current}
              maxHP={enemyPokemonHP.max}
            />
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
      {!gameOver && (
        <>
          <Row className="mt-5 log-options">
            <Col md={8} className="battle-log">
              {currentDisplayedText !== "" ? (
                <p className="text-center battle-message">
                  {currentDisplayedText}
                </p>
              ) : (
                persistentMessage !== "" && (
                  <p className="text-center battle-message">
                    {persistentMessage}
                  </p>
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
        </>
      )}
    </Container>
  );
};

export default Level;
