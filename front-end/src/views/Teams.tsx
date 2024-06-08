import React, { useState, useEffect } from "react";
import { getUserTeams } from "../services/api";
import Team from "../components/Team";
import { TeamData } from "../services/api";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store";
import { setIsLoading } from "../services/auth/authSlice";
import { Container } from "react-bootstrap";
import Loader from "../components/Loader";

const Teams: React.FC = () => {
  const dispatch = useDispatch();
  const isLoading = useSelector((state: RootState) => state.auth.isLoading);
  const [refetch, setRefetch] = useState(false);

  const [team, setTeam] = useState<TeamData>();

  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch(setIsLoading(true));
        const teamsData = await getUserTeams();
        if (teamsData) setTeam(teamsData[0]);
      } catch (error) {
        // Manejar error si es necesario
      } finally {
        dispatch(setIsLoading(false));
      }
    };
    fetchData();
  }, [dispatch, refetch]);

  const onRefetch = () => setRefetch((prev) => !prev);

  return (
    <div>
      <Container className="mt-3 bg-dark text-light rounded">
        <div className="pt-4 d-flex flex-column align-items-center mb-3">
          <h2>{team?.name}</h2>
        </div>
        {isLoading && <Loader />}
        {team ? (
          <Team
            teamName={team.name}
            trainerPokemons={team.trainerPokemons}
            onRefetch={onRefetch}
          />
        ) : (
          <p>No hay equipos disponibles</p>
        )}
      </Container>
    </div>
  );
};

export default Teams;
