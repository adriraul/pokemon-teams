import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { setIsLoading } from "../services/auth/authSlice";
import {
  GameLevel,
  TeamData,
  getUserTeams,
  getUserGameLevel,
} from "../services/api";

const useLevelData = (levelId: string | undefined) => {
  const dispatch = useDispatch();
  const [userTeam, setUserTeam] = useState<TeamData | null>(null);
  const [level, setLevel] = useState<GameLevel | null>(null);
  const [isInitialSelectionOpen, setIsInitialSelectionOpen] = useState(false);
  const [currentPokemonIndex, setCurrentPokemonIndex] = useState(0);
  const [currentLevelPokemonIndex, setCurrentLevelPokemonIndex] = useState(0);

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
            const activePokemonIndex = userTeam.trainerPokemons.findIndex(
              (p) => p.activeInGameLevel
            );
            const activeEnemyIndex = levelData.gameLevelPokemons.findIndex(
              (p) => p.ps > 0
            );

            if (activeEnemyIndex !== -1) {
              setCurrentLevelPokemonIndex(activeEnemyIndex);
            }

            if (levelData.active) {
              if (activePokemonIndex !== -1) {
                setCurrentPokemonIndex(activePokemonIndex);
              } else {
                setIsInitialSelectionOpen(true);
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

export default useLevelData;
