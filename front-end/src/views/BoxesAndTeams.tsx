import React, { useState, useEffect } from "react";
import { getUserBoxes, getUserTeams } from "../services/api";
import Box from "../components/Box";
import Team from "../components/Team";
import { BoxData, TeamData } from "../services/api";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store";
import { setIsLoading } from "../services/auth/authSlice";
import { Button, Container, Row, Col } from "react-bootstrap";
import Loader from "../components/Loader";
import "./styles/BoxesAndTeams.css";

const BoxesAndTeams: React.FC = () => {
  const dispatch = useDispatch();
  const isLoading = useSelector((state: RootState) => state.auth.isLoading);
  const [refetch, setRefetch] = useState(false);

  const [boxes, setBoxes] = useState<BoxData[]>([]);
  const [currentBoxIndex, setCurrentBoxIndex] = useState(0);
  const [team, setTeam] = useState<TeamData>();

  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch(setIsLoading(true));
        const boxesData = await getUserBoxes();
        const teamsData = await getUserTeams();

        if (boxesData) setBoxes(boxesData);
        if (teamsData) setTeam(teamsData[0]);

        dispatch(setIsLoading(false));
      } catch (error) {
        // Handle error if necessary
      }
    };

    fetchData();
  }, [dispatch, refetch]);

  const onRefetch = () => setRefetch((prev) => !prev);

  const handlePrevBox = () => {
    setCurrentBoxIndex((prevIndex) => Math.max(0, prevIndex - 1));
  };

  const handleNextBox = () => {
    setCurrentBoxIndex((prevIndex) =>
      Math.min(boxes.length - 1, prevIndex + 1)
    );
  };

  return (
    <Container className="mt-3 bg-dark text-light rounded">
      <Row>
        {/* Sección del equipo */}
        <Col xs={12} md={3} className="team-section">
          <div className="pt-4 d-flex flex-column align-items-center mb-3">
            {isLoading ? (
              <Loader />
            ) : (
              team && (
                <Team
                  teamName={team.name}
                  trainerPokemons={team.trainerPokemons}
                  onRefetch={onRefetch}
                />
              )
            )}
          </div>
        </Col>

        {/* Sección de las cajas */}
        <Col xs={12} md={9}>
          <div className="pt-4 d-flex flex-column align-items-center mb-3">
            <div className="title-banner-container">
              <button
                className="arrow-button"
                onClick={handlePrevBox}
                disabled={currentBoxIndex === 0}
              >
                {"<"}
              </button>
              <h2 className="title-banner">{boxes[currentBoxIndex]?.name}</h2>
              <button
                className="arrow-button"
                onClick={handleNextBox}
                disabled={currentBoxIndex === boxes.length - 1}
              >
                {">"}
              </button>
            </div>
          </div>

          {isLoading && <Loader />}
          {boxes.length > 0 ? (
            <Box
              boxId={boxes[currentBoxIndex]?.id}
              boxName={boxes[currentBoxIndex]?.name}
              trainerPokemons={boxes[currentBoxIndex]?.trainerPokemons}
              onRefetch={onRefetch}
            />
          ) : (
            <p>No hay cajas disponibles</p>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default BoxesAndTeams;
