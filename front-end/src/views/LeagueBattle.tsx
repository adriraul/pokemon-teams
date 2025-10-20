import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useParams } from "react-router-dom";
import { Container, Row, Col, Button, Modal } from "react-bootstrap";
import {
  UpdatePlayData,
  UpdatedPlayData,
  updatePlay,
  LeagueLevel,
  claimLeagueLevelReward,
  unlockLeagueChampion,
  resetLeagueTeam,
} from "../services/api";
import "./styles/BattleStyles.css";
import { TYPE_MAP } from "../utils/typeMap";
import HealthBar from "../components/HealthBar";
import { useAppDispatch, useAppSelector } from "../hooks/redux/hooks";
import {
  updateBadgesUnlocked,
  updateBalance,
} from "../services/auth/authSlice";
import Loader from "../components/Loader";
import useLeagueLevelData from "../hooks/useLeagueLevelData";
import RewardClaim from "../components/RewardClaim";
import { useLevelTimeTracking } from "../hooks/useLevelTimeTracking";

const LeagueBattle: React.FC = () => {
  const { levelId } = useParams<{ levelId: string }>();
  const {
    userTeam,
    level,
    currentPokemonIndex,
    setCurrentPokemonIndex,
    currentLevelPokemonIndex,
    setCurrentLevelPokemonIndex,
    setLevel,
  } = useLeagueLevelData(levelId);

  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const isLoading = useAppSelector((state) => state.auth.isLoading);
  const [isClaimed, setIsClaimed] = useState(false);

  const [hasCheckedEnemies, setHasCheckedEnemies] = useState(false);
  const [isUserTeamInitialized, setIsUserTeamInitialized] = useState(false);
  const [isLevelInitialized, setIsLevelInitialized] = useState(false);

  const [showModalSwitch, setShowModalSwitch] = useState(false);
  const [intentionalSwitch, setIntetionalSwitch] = useState(true);

  const [gameOver, setGameOver] = useState(false);
  const [showSurrenderConfirm, setShowSurrenderConfirm] = useState(false);
  const [winner, setWinner] = useState<"user" | "level" | null>(null);
  const [fadeToBlack, setFadeToBlack] = useState(false);

  const [showAttackOptions, setShowAttackOptions] = useState(false);
  const [showingBattleOptions, setShowingBattleOptions] = useState(true);

  const [isEnemyAttacked, setIsEnemyAttacked] = useState(false);
  const [isCurrentAttacked, setIsCurrentAttacked] = useState(false);
  const [isEnemyBlinking, setIsEnemyBlinking] = useState(false);
  const [isUserBlinking, setIsUserBlinking] = useState(false);

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

  // Estado local para el equipo que se actualiza correctamente
  const [localUserTeam, setLocalUserTeam] = useState(userTeam);

  // Hook para seguimiento de tiempo
  const { startLevel, completeLevel } = useLevelTimeTracking();

  // Estado para controlar si ya se inició el seguimiento de tiempo
  const [timeTrackingStarted, setTimeTrackingStarted] = useState(false);

  // Función helper para calcular el PS máximo de manera consistente
  const calculateMaxPS = (pokemon: any) => {
    // En la liga, el PS ya incluye los IVs calculados en el backend
    // No necesitamos sumar ivPS * 2 de nuevo
    return pokemon.ps;
  };

  // Función helper para calcular PS del enemigo en liga
  const calculateEnemyMaxPS = (enemyPokemon: any) => {
    // En la liga, el PS ya incluye los IVs calculados en el backend
    return enemyPokemon.ps;
  };

  useEffect(() => {
    if (userTeam) {
      setLocalUserTeam(userTeam);
    }
  }, [userTeam]);

  useEffect(() => {
    if (userTeam) {
      setUserPokemonHP({
        current: userTeam.trainerPokemons[currentPokemonIndex].ps,
        max: calculateMaxPS(userTeam.trainerPokemons[currentPokemonIndex]),
      });
      setIsUserTeamInitialized(true);
    }
  }, [userTeam, currentPokemonIndex, isUserTeamInitialized]);

  useEffect(() => {
    if (level && !isLevelInitialized) {
      setEnemyPokemonHP({
        current: level.gameLevelPokemons[currentLevelPokemonIndex].ps,
        max: calculateEnemyMaxPS(level.gameLevelPokemons[currentLevelPokemonIndex]), // Usar función helper
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

        // Completar seguimiento de tiempo cuando el usuario gana
        if (timeTrackingStarted) {
          completeLevel(level.number, "league")
            .then(() => {
              // Time tracking completed
            })
            .catch((error) => {
              console.error("Error completing time tracking:", error);
            });
        }
      }
      setHasCheckedEnemies(true);
    }
  }, [level, hasCheckedEnemies, timeTrackingStarted]);

  const addToBattleLog = useCallback((newMessage: string) => {
    setLogQueue((prevQueue) => [...prevQueue, newMessage]);
  }, []);

  const handleAttack = async (movementUsedTypeId: number) => {
    setShowingBattleOptions(false);
    setShowAttackOptions(false);
    setPersistentMessage("");
    if (!level || !userTeam) return;

    // Iniciar seguimiento de tiempo en el primer ataque
    if (!timeTrackingStarted) {
      try {
        await startLevel(level.number, "league");
        setTimeTrackingStarted(true);
      } catch (error) {
        console.error("Error starting time tracking:", error);
      }
    }

    const updatePlayData: UpdatePlayData = {
      gameLevelId: level.id,
      currentPokemonId: userTeam.trainerPokemons[currentPokemonIndex].id,
      movementUsedTypeId: movementUsedTypeId,
      enemyPokemonId: level.gameLevelPokemons[currentLevelPokemonIndex].id,
      pokemonChangedId: 0,
      pokemonChangeDefeatId: 0,
      surrender: false,
      league: true,
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
    level: LeagueLevel,
    change: Boolean,
    newIndex?: number
  ) => {
    if (!level || !userTeam) return null;
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
      addToBattleLog(`Your Pokémon used ${attackTypeName}`);
      setIsEnemyAttacked(true);
      setIsEnemyBlinking(true);
      setTimeout(() => {
        setIsEnemyAttacked(false);
        setIsEnemyBlinking(false);
      }, 1500);
    },
    [addToBattleLog]
  );

  const enemyAttack = useCallback(
    (enemyTypeAttack: string) => {
      addToBattleLog(`The enemy used ${enemyTypeAttack}`);
      setIsCurrentAttacked(true);
      setIsUserBlinking(true);
      setTimeout(() => {
        setIsCurrentAttacked(false);
        setIsUserBlinking(false);
      }, 1500);
    },
    [addToBattleLog]
  );

  const playerAttackResult = useCallback(
    (
      damageCausedString: string,
      criticalCaused: boolean,
      damageCaused: number
    ) => {
      let message = "";
      if (criticalCaused) message = "Critical! ";
      message += damageCausedString;
      addToBattleLog(message);
      setEnemyPokemonHP((prev) => ({
        ...prev,
        current: Math.max(prev.current - damageCaused, 0),
      }));
    },
    [addToBattleLog]
  );

  const enemyAttackResult = useCallback(
    (
      damageReceivedString: string,
      criticalReceived: boolean,
      damageReceived: number
    ) => {
      let message = "";
      if (criticalReceived) message = "¡Crítico! ";
      message += damageReceivedString;
      addToBattleLog(message);
      setUserPokemonHP((prev) => ({
        ...prev,
        current: Math.max(prev.current - damageReceived, 0),
      }));
    },
    [addToBattleLog]
  );

  const getRandomAttack = (typeId: number): string => {
    try {
      const attacks = TYPE_MAP[typeId];
      const randomIndex = Math.floor(Math.random() * attacks.length);
      return attacks[randomIndex];
    } catch (error) {
      return "Unknown Attack";
    }
  };

  useEffect(() => {
    if (gameOver && winner !== "user") {
      setFadeToBlack(true);
    }
  }, [gameOver, winner]);

  useEffect(() => {
    if (fadeToBlack) {
      const timer = setTimeout(() => {
        navigate("/league");
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [fadeToBlack]);

  useEffect(() => {
    if (!battleData || !level) return;

    const attackTypeName = getRandomAttack(battleData.attackCaused);
    const receivedAttackTypeName = getRandomAttack(battleData.attackReceived);

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
        battleData.criticalCaused,
        battleData.damageCaused
      );
      setTimeout(() => {
        if (battleData.enemyPokemonPs > 0) {
          setTurnStage("enemyPostAttack");
        } else {
          setTurnStage("nextPokemon");
        }
      }, 3000);
    }

    if (turnStage === "enemyAttackResult") {
      enemyAttackResult(
        battleData.damageReceivedString,
        battleData.criticalReceived,
        battleData.damageReceived
      );
      setTimeout(() => {
        if (battleData.currentPokemonPs > 0) {
          setTurnStage("playerPostAttack");
        } else {
          setTurnStage("pokemonFainted");
        }
      }, 3000);
    }

    if (turnStage === "playerPostAttack") {
      playerAttack(attackTypeName);
      setTimeout(() => {
        setTurnStage("playerPostAttackResult");
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
        battleData.criticalCaused,
        battleData.damageCaused
      );
      setTimeout(() => {
        if (battleData.enemyPokemonPs > 0) {
          setTurnStage("idle");
        } else {
          setTurnStage("nextPokemon");
        }
      }, 3000);
    }

    if (turnStage === "enemyPostAttackResult") {
      enemyAttackResult(
        battleData.damageReceivedString,
        battleData.criticalReceived,
        battleData.damageReceived
      );
      setTimeout(() => {
        if (battleData.currentPokemonPs > 0) {
          setTurnStage("idle");
        } else {
          setTurnStage("pokemonFainted");
        }
      }, 3000);
    }

    if (turnStage === "pokemonFainted") {
      addToBattleLog(`Your Pokémon has fainted.`);
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
          `The enemy Pokémon has fainted. ${level?.gameLevelPokemons[nextEnemyIndex].pokemon.name} will appear.`
        );

        setCurrentLevelPokemonIndex(nextEnemyIndex);
        setEnemyPokemonHP({
          current: level?.gameLevelPokemons[nextEnemyIndex].ps,
          max:
            level?.gameLevelPokemons[nextEnemyIndex].pokemon.ps +
            level?.gameLevelPokemons[nextEnemyIndex].ivPS * 2,
        });
        setTurnStage("idle");
      } else {
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
    const response = await unlockLeagueChampion();
    await resetLeagueTeam();
    if (response === true) {
      toast.success(`Unlocked league champion`);
    }
  };

  const handleAttackButton = () => {
    setShowAttackOptions(true);
  };

  const handleSwitchPokemon = async (index: number) => {
    if (!level || !userTeam) return;

    // Guardar el PS del Pokémon que estaba activo ANTES del cambio
    const previousActivePokemonPS = userPokemonHP.current;

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
      league: true,
    };

    setCurrentPokemonIndex(index);
    setShowModalSwitch(false);

    const updatedData = await updatePlay(updatePlayData);

    if (intentionalSwitch) {
      setBattleData(updatedData);
    }

    setUserPokemonHP({
      current: userTeam.trainerPokemons[index].ps,
      max: calculateMaxPS(userTeam.trainerPokemons[index]),
    });

    // Actualizar el equipo local para que las mini barras muestren el PS correcto
    if (localUserTeam) {
      const updatedTeam = { ...localUserTeam };
      // El Pokémon que estaba activo ahora tiene el PS que tenía ANTES del cambio
      updatedTeam.trainerPokemons[currentPokemonIndex] = {
        ...updatedTeam.trainerPokemons[currentPokemonIndex],
        ps: previousActivePokemonPS, // ← PS del Pokémon que estaba activo
      };
      setLocalUserTeam(updatedTeam);
    }

    if (updatedData && intentionalSwitch) {
      processBattleResponse(updatedData, level, intentionalSwitch, index);
    } else {
      setTurnStage("idle");
    }
  };

  const handleCancelSurrender = async () => {
    setShowSurrenderConfirm(false);
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
      league: true,
    };

    await updatePlay(updatePlayData);
    setShowSurrenderConfirm(false);
    setGameOver(true);
    setWinner("level");
    return <div className={`screen-fade ${fadeToBlack ? "active" : ""}`}></div>;
  };

  const handleOpenPokemonModal = (intentionalSwitch: boolean) => {
    setIntetionalSwitch(intentionalSwitch);
    if (intentionalSwitch === false) {
      if (userTeam?.trainerPokemons.every((pokemon) => pokemon.ps === 0)) {
        handleSurrender();
      } else {
        setShowModalSwitch(true);
      }
    } else {
      setShowModalSwitch(true);
    }
  };

  const handleClaimReward = async () => {
    if (!level) return;

    try {
      const response = await claimLeagueLevelReward(level.id);
      if (response) {
        toast.success(`Reward claimed: ${level.reward} coins.`);
        dispatch(updateBalance(response.newBalance));
        dispatch(updateBadgesUnlocked(response.badgesUnlocked));
        setIsClaimed(true);
        handleUnlockNextLevel();
        navigate("/league");
      }
    } catch (error) {
      console.error("Error claiming reward:", error);
    }
  };

  const renderAttackOptions = () => {
    if (!userTeam) return null;
    const currentPokemon = userTeam.trainerPokemons[currentPokemonIndex];

    const sortedMovements = [...currentPokemon.movements].sort(
      (a, b) => a.pokemonType.id - b.pokemonType.id
    );

    return sortedMovements.map((movement) => (
      <Button
        key={movement.id}
        className={`attack-button button-${movement.pokemonType.name.toLowerCase()}`}
        onClick={() => handleAttack(movement.pokemonType.id)}
      >
        {movement.pokemonType.name}
      </Button>
    ));
  };

  const renderSurrenderConfirmModal = () => {
    return (
      <Modal
        onHide={handleCancelSurrender}
        show={showSurrenderConfirm}
        size="sm"
        centered
      >
        <Modal.Header
          style={{
            background: "#333333",
            border: "1px solid #666666",
            padding: "8px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Modal.Title style={{ color: "white" }}>
            ¿Seguro que rendirte?
          </Modal.Title>
        </Modal.Header>
        <Modal.Footer
          style={{
            background: "#333333",
            border: "1px solid #666666",
            padding: "8px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Button variant="secondary" onClick={handleCancelSurrender}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={handleSurrender}>
            Aceptar
          </Button>
        </Modal.Footer>
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
                  ).padStart(3, "0")}.avif`}
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

  const renderTeamQueue = () => {
    if (!level || !localUserTeam) return null;
    return (
      <Row className="mt-4 justify-content-center">
        {localUserTeam.trainerPokemons.map((pokemon, index) => {
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
                  ).padStart(3, "0")}.avif`}
                  alt={pokemon.pokemon.name}
                  style={{
                    width: "70%",
                    filter: pokemon.ps <= 0 ? "grayscale(1)" : "none",
                    borderRadius: "50%",
                  }}
                />
                {/* Mini Health Bar */}
                <div className="mini-health-bar-container mt-1">
                  <div className="mini-health-bar">
                    <div
                      className="mini-health-bar-fill"
                      style={{
                        width: `${Math.max(
                          0,
                          (pokemon.ps / calculateMaxPS(pokemon)) * 100
                        )}%`,
                        backgroundColor:
                          pokemon.ps <= 0
                            ? "#666"
                            : (pokemon.ps / calculateMaxPS(pokemon)) * 100 < 25
                            ? "#f44336"
                            : (pokemon.ps / calculateMaxPS(pokemon)) * 100 < 50
                            ? "#ffeb3b"
                            : "#4caf50",
                      }}
                    />
                  </div>
                </div>
              </Col>
            );
          }
          return null;
        })}
      </Row>
    );
  };

  if (isLoading || !level || !userTeam || !userPokemonHP || !enemyPokemonHP) {
    return <Loader />;
  }

  return (
    <Container
      fluid
      style={{
        backgroundColor: "transparent",
        color: "white",
        minHeight: "100vh",
        padding: "20px",
      }}
    >
      <h1 className="text-center mb-4">{`${level.leaderName}`}</h1>
      {showModalSwitch && renderSwitchPokemonModal()}
      {showSurrenderConfirm && renderSurrenderConfirmModal()}

      {gameOver ? (
        winner === "user" ? (
          <RewardClaim
            level={level}
            handleClaimReward={handleClaimReward}
            isClaimed={isClaimed}
          />
        ) : (
          <div className={`screen-fade ${fadeToBlack ? "active" : ""}`}></div>
        )
      ) : (
        <Row className="align-items-center">
          <Col md={6} className="text-center">
            <div className="pokemon-container">
              <div className={`${isEnemyAttacked ? "attack-animation" : ""}`}>
                <img
                  src={`/images/pokedex/${String(
                    userTeam.trainerPokemons[currentPokemonIndex].pokemon
                      .pokedex_id
                  ).padStart(3, "0")}.png`}
                  alt={`Pokémon ${userTeam.trainerPokemons[currentPokemonIndex].pokemon.name}`}
                  className={`img-fluid self-pokemon-img ${
                    isUserBlinking
                      ? !userTeam.trainerPokemons[currentPokemonIndex].pokemon
                          .invertedImage
                        ? "blink-inverted"
                        : "blink"
                      : ""
                  } ${
                    !userTeam.trainerPokemons[currentPokemonIndex].pokemon
                      .invertedImage
                      ? "self-img-inverted"
                      : "self-img-not-inverted"
                  }`}
                />
              </div>
              <div className="playground">
                <img
                  src={`/images/elements/playground.png`}
                  alt={`Playground`}
                />
              </div>
              <HealthBar
                nickname={
                  userTeam.trainerPokemons[currentPokemonIndex].nickname
                }
                level={
                  userTeam.trainerPokemons[currentPokemonIndex].pokemon.power
                }
                currentHP={userPokemonHP.current}
                maxHP={userPokemonHP.max}
                league={true}
              />
            </div>
            {renderTeamQueue()}
          </Col>
          <Col md={6} className="text-center">
            <div className="pokemon-container-enemy">
              <HealthBar
                nickname={
                  level.gameLevelPokemons[currentLevelPokemonIndex].pokemon.name
                }
                level={
                  level.gameLevelPokemons[currentLevelPokemonIndex].pokemon
                    .power
                }
                currentHP={enemyPokemonHP.current}
                maxHP={enemyPokemonHP.max}
                league={true}
              />
              <div
                className={`${
                  isCurrentAttacked ? "enemy-attack-animation" : ""
                }`}
              >
                <img
                  src={`/images/pokedex/${String(
                    level.gameLevelPokemons[currentLevelPokemonIndex].pokemon
                      .pokedex_id
                  ).padStart(3, "0")}.png`}
                  alt={`Pokémon ${level.gameLevelPokemons[currentLevelPokemonIndex].pokemon.name}`}
                  className={`img-fluid pokemon-img ${
                    isEnemyBlinking
                      ? level.gameLevelPokemons[currentLevelPokemonIndex]
                          .pokemon.invertedImage
                        ? "blink-inverted"
                        : "blink"
                      : ""
                  } ${
                    level.gameLevelPokemons[currentLevelPokemonIndex].pokemon
                      .invertedImage
                      ? "enemy-img-inverted"
                      : "enemy-img-not-inverted"
                  }`}
                  style={{ width: "250px", height: "250px" }}
                />
              </div>
              <div className="playground-enemy">
                <img
                  src={`/images/elements/playground.png`}
                  alt={`Playground`}
                />
              </div>
            </div>
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
                      onClick={() => setShowSurrenderConfirm(true)}
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

export default LeagueBattle;
