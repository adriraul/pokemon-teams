import React, { useState, useEffect } from "react";
import { TrainerPokemon, getUserTeams } from "../services/api";
import Team from "../components/Team";
import { TeamData } from "../services/api";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store";
import { setIsLoading } from "../services/auth/authSlice";
import { Container } from "react-bootstrap";

const Teams: React.FC = () => {
  const dispatch = useDispatch();
  const isLoading = useSelector((state: RootState) => state.auth.isLoading);

  const [team, setTeam] = useState<TeamData>();

  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch(setIsLoading(true));
        const teamsData = await getUserTeams();
        setTeam(teamsData[0]);
      } catch (error) {
        // Manejar error si es necesario
      } finally {
        dispatch(setIsLoading(false));
      }
    };
    fetchData();
  }, [dispatch]);

  const handleReleasePokemon = (
    releasedPokemon: TrainerPokemon | undefined
  ) => {
    setTeam((prevTeam) => {
      if (prevTeam && releasedPokemon) {
        const updatedTeam = {
          ...prevTeam,
          trainerPokemons: prevTeam.trainerPokemons?.filter(
            (pokemon) => pokemon.id !== releasedPokemon.id
          ),
        };
        return updatedTeam;
      }
      return prevTeam;
    });
  };

  return (
    <div>
      <Container className="mt-3 bg-dark text-light rounded">
        <div className="pt-4 d-flex flex-column align-items-center mb-3">
          <h2>{team?.name}</h2>
        </div>
        {team ? (
          <Team
            teamName={team.name}
            trainerPokemons={team.trainerPokemons}
            onReleasePokemon={handleReleasePokemon}
          />
        ) : (
          <p>No hay equipos disponibles</p>
        )}
      </Container>
    </div>
  );
};

export default Teams;
