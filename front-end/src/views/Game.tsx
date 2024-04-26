import React, { useState, useEffect } from "react";
import { GameLevel, getUserGameLevels } from "../services/api";
import { Card, Container, Row, Col, CardTitle } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store";
import { setIsLoading } from "../services/auth/authSlice";
import { useNavigate } from "react-router-dom";

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

  const handleLevelClick = (level: GameLevel) => {
    //navigate(`/level/${level.id}`, { state: { level } });
    navigate(`/level/${level.id}`);
  };

  const renderLevelCards = () => {
    return gameLevels.map((level) => (
      <Col key={level.id} xs={12} sm={6} md={4} lg={3} className="mb-4">
        <CardTitle style={{ textAlign: "center", marginBottom: "5px" }}>
          Nivel {level.number}
        </CardTitle>
        <Card
          bg="dark"
          text="white"
          className="text-center"
          onClick={() => handleLevelClick(level)}
          style={{
            cursor: "pointer",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {level.blocked && (
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backdropFilter: "blur(5px)",
                zIndex: 1,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <img
                src="/images/elements/buttons/candado.png"
                alt="Candado"
                style={{
                  width: "12%",
                  height: "50%",
                  zIndex: 2,
                  filter: "invert(100%)",
                }}
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
                      ).padStart(3, "0")}.png`}
                      alt={gameLevelPokemon.pokemon.pokedex_id}
                      width="100%"
                      className="rounded-circle"
                    />
                  </Col>
                ))}
            </Row>
          </Card.Body>
        </Card>
      </Col>
    ));
  };

  return (
    <Container className="mt-3">
      <h1 className="text-center mb-4">Niveles</h1>
      <Row>
        {gameLevels.length > 0 ? (
          renderLevelCards()
        ) : (
          <Col>
            <p className="text-center">No hay niveles disponibles</p>
          </Col>
        )}
      </Row>
    </Container>
  );
};

export default Game;
