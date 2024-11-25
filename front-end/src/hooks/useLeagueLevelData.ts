import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { setIsLoading } from "../services/auth/authSlice";
import {
  getLeagueTeam,
  getLeagueLevel,
  TeamData,
  LeagueLevel,
} from "../services/api";

const useLeagueLevelData = (levelId: string | undefined) => {
  const dispatch = useDispatch();
  const [userTeam, setUserTeam] = useState<TeamData | null>(null);
  const [level, setLevel] = useState<LeagueLevel | null>(null);
  const [currentPokemonIndex, setCurrentPokemonIndex] = useState(0);
  const [currentLevelPokemonIndex, setCurrentLevelPokemonIndex] = useState(0);

  useEffect(() => {
    const fetchUserTeam = async () => {
      dispatch(setIsLoading(true));
      try {
        const teamData = await getLeagueTeam();
        if (teamData) {
          setUserTeam(teamData);

          const activePokemonIndex = teamData.trainerPokemons.findIndex(
            (p) => p.activeInLeagueLevel
          );
          if (activePokemonIndex !== -1) {
            setCurrentPokemonIndex(activePokemonIndex);
          } else {
            const defaultPokemonIndex = teamData.trainerPokemons.findIndex(
              (p) => p.leagueOrder === 1
            );
            if (defaultPokemonIndex !== -1) {
              setCurrentPokemonIndex(defaultPokemonIndex);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching league team:", error);
      } finally {
        dispatch(setIsLoading(false));
      }
    };

    fetchUserTeam();
  }, [dispatch]);

  useEffect(() => {
    const fetchLeagueLevel = async () => {
      if (levelId) {
        dispatch(setIsLoading(true));
        try {
          const leagueData = await getLeagueLevel(levelId);
          if (leagueData) {
            setLevel(leagueData);

            const activeEnemyIndex = leagueData.gameLevelPokemons.findIndex(
              (p) => p.ps > 0
            );
            if (activeEnemyIndex !== -1) {
              setCurrentLevelPokemonIndex(activeEnemyIndex);
            }
          }
        } catch (error) {
          console.error("Error fetching league level:", error);
        } finally {
          dispatch(setIsLoading(false));
        }
      }
    };

    fetchLeagueLevel();
  }, [dispatch, levelId]);

  return {
    userTeam,
    level,
    currentPokemonIndex,
    setCurrentPokemonIndex,
    currentLevelPokemonIndex,
    setCurrentLevelPokemonIndex,
    setLevel,
  };
};

export default useLeagueLevelData;
