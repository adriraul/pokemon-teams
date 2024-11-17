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
  const [isInitialSelectionOpen, setIsInitialSelectionOpen] = useState(false);
  const [currentPokemonIndex, setCurrentPokemonIndex] = useState(0);
  const [currentLevelPokemonIndex, setCurrentLevelPokemonIndex] = useState(0);

  useEffect(() => {
    const fetchUserTeam = async () => {
      dispatch(setIsLoading(true));
      try {
        const teamData = await getLeagueTeam();
        if (teamData) {
          setUserTeam(teamData);
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
      if (levelId && userTeam) {
        dispatch(setIsLoading(true));
        try {
          const leagueData = await getLeagueLevel(levelId);
          if (leagueData) {
            setLevel(leagueData);
            console.log(leagueData);
          }
        } catch (error) {
          console.error("Error fetching league level:", error);
        } finally {
          dispatch(setIsLoading(false));
        }
      }
    };
    fetchLeagueLevel();
  }, [dispatch, levelId, userTeam]);

  useEffect(() => {
    if (userTeam && level) {
      const activePokemonIndex = userTeam.trainerPokemons.findIndex(
        (p) => p.ps > 0
      );

      const activeEnemyIndex = level.gameLevelPokemons.findIndex(
        (p) => p.ps > 0
      );

      if (activeEnemyIndex !== -1) {
        setCurrentLevelPokemonIndex(activeEnemyIndex);
      }

      if (level.active) {
        if (activePokemonIndex !== -1) {
          setCurrentPokemonIndex(activePokemonIndex);
        } else {
          setIsInitialSelectionOpen(true);
        }
      } else {
        setIsInitialSelectionOpen(true);
      }
    }
  }, [userTeam, level]);

  return {
    userTeam,
    level,
    isInitialSelectionOpen,
    setIsInitialSelectionOpen,
    currentPokemonIndex,
    setCurrentPokemonIndex,
    currentLevelPokemonIndex,
    setCurrentLevelPokemonIndex,
    setLevel,
  };
};

export default useLeagueLevelData;
