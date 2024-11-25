import React, { useState, useEffect } from "react";
import {
  GameLevel,
  getUserGameLevels,
  isUserTeamAbleToPlayLevel,
} from "../services/api";
import { Card, Container, Row, Col, CardTitle } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store";
import { setIsLoading } from "../services/auth/authSlice";
import { useNavigate } from "react-router-dom";
import Loader from "../components/Loader";
import "./styles/Game.css";

const Game: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isLoading = useSelector((state: RootState) => state.auth.isLoading);

  const [gameLevels, setGameLevels] = useState<GameLevel[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch(setIsLoading(true));
        const levelsData = await getUserGameLevels();
        if (levelsData) setGameLevels(levelsData);
      } catch (error) {
        // Manejar error si es necesario
      } finally {
        dispatch(setIsLoading(false));
      }
    };

    fetchData();
  }, [dispatch]);

  const handleLevelClick = async (level: GameLevel) => {
    const canTeamPlay = await isUserTeamAbleToPlayLevel();
    if (!level.blocked && !level.passed && canTeamPlay) {
      navigate(`/level/${level.id}`);
    }
  };

  const renderLevelCards = () => {
    return gameLevels.map((level) => (
      <Col key={level.id} xs={12} sm={6} md={4} lg={3} className="mb-4">
        <CardTitle className="card-title">Level {level.number}</CardTitle>
        <Card
          bg="dark"
          text="white"
          className={`text-center ${
            !level.blocked && !level.passed ? "current-level" : ""
          }`}
          onClick={() => handleLevelClick(level)}
          style={{
            cursor: level.blocked || level.passed ? "not-allowed" : "pointer",
          }}
        >
          {level.blocked && (
            <div className="blocked-overlay">
              <img
                src="/images/elements/buttons/candado.png"
                alt="Candado"
                className="overlay-image invert"
              />
            </div>
          )}
          {level.passed && (
            <div className="passed-overlay">
              <img
                src="/images/elements/buttons/tick.png"
                alt="Tick"
                className="overlay-image"
              />
            </div>
          )}
          <Card.Body>
            <Row className="g-2">
              {level.gameLevelPokemons
                ?.slice(0, 6)
                .map((gameLevelPokemon, index) => (
                  <Col key={index} xs={2}>
                    <img
                      src={`/images/pokedex/${String(
                        gameLevelPokemon.pokemon.pokedex_id
                      ).padStart(3, "0")}.avif`}
                      alt={gameLevelPokemon.pokemon.pokedex_id}
                      className="pokemon-image"
                    />
                  </Col>
                ))}
            </Row>
            <div className="rewards-section">
              <h6>Rewards:</h6>
              <div className="reward-amount-levels">${level.reward}</div>
            </div>
          </Card.Body>
        </Card>
      </Col>
    ));
  };

  return (
    <Container className="mt-3 game-container">
      {isLoading && <Loader />}
      <h1 className="text-center mb-4">LEVELS</h1>
      <Row>{gameLevels.length > 0 && renderLevelCards()}</Row>
    </Container>
  );
};

export default Game;
