import axios, { AxiosError, AxiosInstance } from "axios";
import authHeader from "./authHeader";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export interface User {
  username: string;
  balance: number;
  email: string;
  trainerPokemons: TrainerPokemon[];
  boxes: BoxData[];
  teams: TeamData[];
}

export interface Pokemon {
  id: number;
  name: string;
  pokedex_id: string;
  power: number;
  pokemonTypes: PokemonType[];
  ps: number;
  invertedImage: boolean;
}

export interface TrainerPokemon {
  id: number;
  level: string;
  pokemon: Pokemon;
  orderInBox: number;
  orderInTeam: number;
  leagueOrder: number;
  nickname: string;
  movements: Movement[];
  ps: number;
  activeInGameLevel: boolean;
  activeInLeagueLevel: boolean;
  ivPS: number;
  ivAttack: number;
  ivDefense: number;
}

export interface PokemonType {
  id: number;
  name: string;
}

export interface Movement {
  id: number;
  pokemonType: PokemonType;
  quantity: number;
}

export interface BoxData {
  id: number;
  name: string;
  trainerPokemons: TrainerPokemon[];
}

export interface TeamData {
  id: number;
  name: string;
  trainerPokemons: TrainerPokemon[];
}

export interface OpenPokeballData {
  newBalance: string;
  newPokemonTrainer: TrainerPokemon;
  badgesUnlocked: string;
}

export interface UserUpdatedBalanceData {
  newBalance: string;
  badgesUnlocked: string;
}

export interface ProbInfo {
  percentage: string;
  pokemons: string[];
}

export interface TrainerPokedexData {
  pokemonId: number;
}

export interface GameLevel {
  id: number;
  number: number;
  passed: boolean;
  blocked: boolean;
  active: boolean;
  gameLevelPokemons: GameLevelPokemons[];
  reward: number;
  unlocksAccessoryId: string;
  badgeWonId: number;
}

export interface NextGameLevel {
  nextGameLevel: GameLevel;
}

export interface GameLevelPokemons {
  id: number;
  order: number;
  dead: boolean;
  ps: number;
  pokemon: Pokemon;
  ivPS: number;
}

export interface UpdatePlayData {
  gameLevelId: number;
  currentPokemonId: number;
  movementUsedTypeId: number;
  enemyPokemonId: number;
  pokemonChangedId: number;
  pokemonChangeDefeatId: number;
  surrender: boolean;
  league: boolean;
}

export interface UpdatedPlayData {
  remainingMoves: Movement[];
  damageCausedString: string;
  criticalCaused: boolean;
  damageCaused: number;
  attackCaused: number;
  currentPokemonPs: number;
  damageReceivedString: string;
  criticalReceived: boolean;
  damageReceived: number;
  attackReceived: number;
  enemyPokemonPs: number;
  firstAttacker: string;
}

export interface TeamAbleToPLayResponse {
  ableToPlay: boolean;
}

export interface AvatarOptionsResponse {
  avatarOptions: Record<string, string>;
}

export type AvatarOptions = {
  background: string;
  ground: string;
  head: string;
  feet: string;
  eyes: string;
  hand: string;
  mouth: string;
};

export interface Accessory {
  id: string;
  unlocked: number;
}

export interface Accessories {
  handAccessories: Accessory[];
  headAccessories: Accessory[];
  feetAccessories: Accessory[];
  mouthAccessories: Accessory[];
  eyesAccessories: Accessory[];
}

export interface AccessoryInfo {
  code: string;
  name: string;
  description: string;
}

export interface UserStats {
  victories: number;
  defeats: number;
  pokeballsOpened: number;
  superballsOpened: number;
  ultraballsOpened: number;
  moneySpent: number;
  pokedex: number;
}

export interface LeagueLevel {
  id: number;
  number: number;
  leaderName: string;
  passed: boolean;
  blocked: boolean;
  active: boolean;
  gameLevelPokemons: GameLevelPokemons[];
  reward: number;
  badgeWonId: number;
  unlocksAccessoryId: string;
}

const api: AxiosInstance = axios.create({
  baseURL: "http://localhost:8080",
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response && error.response.status === 401) {
      console.error("Token expired. Perform logout.");
    } else {
      console.error("Error: ", error.message);
    }
    return Promise.reject(error);
  }
);

export const getPokemonList = async (): Promise<Pokemon[] | null> => {
  try {
    const response = await api.get("/pokemon", {
      headers: authHeader(),
    });
    return response.data;
  } catch (error) {
    showError(error);
    console.error("Error fetching data: ", error);
    return null;
  }
};

export const getUserBoxes = async (): Promise<BoxData[] | null> => {
  try {
    const response = await api.get("/user/allBoxes", {
      headers: authHeader(),
    });
    return response.data;
  } catch (error) {
    showError(error);
    console.error("Error fetching data: ", error);
    return null;
  }
};

export const getUserTeams = async (): Promise<TeamData[] | null> => {
  try {
    const response = await api.get("/user/allTeams", {
      headers: authHeader(),
    });
    return response.data;
  } catch (error) {
    showError(error);
    console.error("Error fetching data: ", error);
    return null;
  }
};

export const addPokemonToUser = async (
  pokedexId: string
): Promise<User | null> => {
  try {
    const response = await api.post(
      "/user/addPokemonToUser?pokedexId=" + pokedexId,
      {},
      {
        headers: authHeader(),
      }
    );
    toast.success("The pokemon has been caught");
    return response.data;
  } catch (error) {
    showError(error);
    console.error("Error fetching data: ", error);
    return null;
  }
};

export const removePokemonFromUser = async (
  trainerPokemonId: number
): Promise<User | null> => {
  try {
    const response = await api.delete(
      "/user/removePokemonFromUser?trainerPokemonId=" + trainerPokemonId,
      {
        headers: authHeader(),
      }
    );
    toast.success("The pokemon has been released");
    return response.data;
  } catch (error) {
    showError(error);
    console.error("Error fetching data: ", error);
    return null;
  }
};

export const assignPokemonToFirstTeam = async (
  trainerPokemonIdToTeam: number
): Promise<void | null> => {
  try {
    const response = await api.post(
      "/user/assignPokemonToFirstTeam?trainerPokemonIdToTeam=" +
        trainerPokemonIdToTeam,
      {},
      {
        headers: authHeader(),
      }
    );
    toast.success("He has been assigned to the team");
    return response.data;
  } catch (error) {
    showError(error);
    console.error("Error fetching data: ", error);
    return null;
  }
};

export const sendPokemonToFirstBox = async (
  trainerPokemonIdToBox: number
): Promise<void | null> => {
  try {
    const response = await api.post(
      "/user/sendPokemonToFirstBox?trainerPokemonIdToBox=" +
        trainerPokemonIdToBox,
      {},
      {
        headers: authHeader(),
      }
    );
    toast.success("The pokemon has returned to box");
    return response.data;
  } catch (error) {
    showError(error);
    console.error("Error fetching data: ", error);
    return null;
  }
};

export const changeBoxForTeamPokemon = async (
  trainerPokemonIdToTeam: number,
  trainerPokemonIdToBox: number
): Promise<void | null> => {
  try {
    const response = await api.post(
      "/user/switchBoxForTeamPokemon?trainerPokemonIdToTeam=" +
        trainerPokemonIdToTeam +
        "&trainerPokemonIdToBox=" +
        trainerPokemonIdToBox,
      {},
      {
        headers: authHeader(),
      }
    );
    toast.success("Pokemon changed");
    return response.data;
  } catch (error) {
    showError(error);
    console.error("Error fetching data: ", error);
    return null;
  }
};

export const openPokeball = async (
  pokeballType: string
): Promise<OpenPokeballData | null> => {
  try {
    const response = await api.post(
      "/user/openPokeball",
      { pokeballType },
      {
        headers: authHeader(),
      }
    );
    toast.success("Successful purchase!");
    return response.data;
  } catch (error) {
    showError(error);
    console.error("Error fetching data: ", error);
    return null;
  }
};

export const redeemCode = async (
  code: string
): Promise<UserUpdatedBalanceData | null> => {
  try {
    const response = await api.post(
      "/user/redeemCode?code=" + code,
      {},
      {
        headers: authHeader(),
      }
    );
    toast.success("Code applied.");
    return response.data;
  } catch (error) {
    showError(error);
    console.error("Error fetching data: ", error);
    return null;
  }
};

export const updateNickname = async (
  nickname: string,
  trainerPokemonId: string
): Promise<UserUpdatedBalanceData | null> => {
  try {
    const response = await api.patch(
      `/trainerPokemon/${trainerPokemonId}`,
      { nickname },
      {
        headers: authHeader(),
      }
    );
    toast.success("Nickname assigned successfuly.");
    return response.data;
  } catch (error) {
    showError(error);
    console.error("Error fetching data: ", error);
    return null;
  }
};

export const getPokeballProbs = async (
  pokeballType: string
): Promise<{
  [key: string]: { percentage: string; pokemons: string[] };
} | null> => {
  try {
    const response = await api.get(`/pokemon/pokeballProbs/${pokeballType}`);
    return response.data;
  } catch (error) {
    showError(error);
    console.error("Error fetching data: ", error);
    return null;
  }
};

export const getPokedexByUser = async (): Promise<
  TrainerPokedexData[] | null
> => {
  try {
    const response = await api.get(`/user/pokedex`, {
      headers: authHeader(),
    });
    return response.data;
  } catch (error) {
    showError(error);
    console.error("Error fetching data: ", error);
    return null;
  }
};

export const getUserGameLevels = async (): Promise<GameLevel[] | null> => {
  try {
    const response = await api.get("/user/allGameLevels", {
      headers: authHeader(),
    });
    return response.data;
  } catch (error) {
    showError(error);
    console.error("Error fetching game levels: ", error);
    return null;
  }
};

export const getUserGameLevel = async (
  levelId: string
): Promise<GameLevel | null> => {
  try {
    const response = await api.get(`/user/gameLevel/${levelId}`, {
      headers: authHeader(),
    });
    return response.data;
  } catch (error) {
    showError(error);
    console.error("Error fetching game levels: ", error);
    return null;
  }
};

export const updatePlay = async (
  data: UpdatePlayData
): Promise<UpdatedPlayData | null> => {
  try {
    const response = await api.post(
      `/gameLevel/updateGameLevelState`,
      {
        data,
      },
      { headers: authHeader() }
    );
    return response.data.responseData;
  } catch (error) {
    showError(error);
    console.error("Internal error: ", error);
    return null;
  }
};

export const unlockNextGameLevel = async (): Promise<NextGameLevel | null> => {
  try {
    const response = await api.post(
      `/gameLevel/unlockNextGameLevel`,
      {},
      { headers: authHeader() }
    );
    return response.data;
  } catch (error) {
    showError(error);
    console.error("Internal error: ", error);
    return null;
  }
};

export const claimGameLevelReward = async (
  gameLevelId: number
): Promise<UserUpdatedBalanceData | null> => {
  try {
    const response = await api.post(
      `/gameLevel/claimGameLevelReward?gameLevelId=${gameLevelId}`,
      {},
      { headers: authHeader() }
    );
    return response.data;
  } catch (error) {
    showError(error);
    console.error("Internal error: ", error);
    return null;
  }
};

export const claimLeagueLevelReward = async (
  gameLevelId: number
): Promise<UserUpdatedBalanceData | null> => {
  try {
    const response = await api.post(
      `/gameLevel/claimLeagueLevelReward?gameLevelId=${gameLevelId}`,
      {},
      { headers: authHeader() }
    );
    return response.data;
  } catch (error) {
    showError(error);
    console.error("Internal error: ", error);
    return null;
  }
};

export const resetLeagueTeam = async (): Promise<TeamData | null> => {
  try {
    const response = await api.get(`/user/resetLeagueTeam`, {
      headers: authHeader(),
    });
    return response.data;
  } catch (error) {
    showError(error);
    console.error("Internal error: ", error);
    return null;
  }
};

export const dragPokemonInBox = async (
  trainerPokemonId: number,
  orderInBox: number,
  boxId: number
): Promise<void | null> => {
  try {
    const response = await api.post(
      `/trainerPokemon/dragPokemonInBox`,
      {
        trainerPokemonId,
        orderInBox,
        boxId,
      },
      { headers: authHeader() }
    );
    return response.data;
  } catch (error) {
    showError(error);
    console.error("Internal error: ", error);
    return null;
  }
};

export const dragPokemonInTeam = async (
  trainerPokemonId: number,
  orderInTeam: number,
  teamId: number
): Promise<void | null> => {
  try {
    const response = await api.post(
      `/trainerPokemon/dragPokemonInTeam`,
      {
        trainerPokemonId,
        orderInTeam,
        teamId,
      },
      { headers: authHeader() }
    );
    return response.data;
  } catch (error) {
    showError(error);
    console.error("Internal error: ", error);
    return null;
  }
};

export const movePokemonFromTeamToBox = async (
  trainerPokemonId: number,
  orderInBox: number,
  boxId: number
): Promise<void | null> => {
  try {
    const response = await api.post(
      `/trainerPokemon/movePokemonFromTeamToBox`,
      {
        trainerPokemonId,
        orderInBox,
        boxId,
      },
      { headers: authHeader() }
    );
    return response.data;
  } catch (error) {
    showError(error);
    console.error("Internal error: ", error);
    return null;
  }
};

export const movePokemonFromBoxToTeam = async (
  trainerPokemonId: number,
  orderInTeam: number,
  teamId: number
): Promise<void | null> => {
  try {
    const response = await api.post(
      `/trainerPokemon/movePokemonFromBoxToTeam`,
      {
        trainerPokemonId,
        orderInTeam,
        teamId,
      },
      { headers: authHeader() }
    );
    return response.data;
  } catch (error) {
    showError(error);
    console.error("Internal error: ", error);
    return null;
  }
};

export const isUserTeamAbleToPlayLevel = async (): Promise<boolean> => {
  try {
    const response = await api.get("/user/isUserTeamAbleToPlayLevel/", {
      headers: authHeader(),
    });
    if (response.data.ableToPlay === false) {
      toast.error(
        "Your team is not able to play this level. Please check your team and try again."
      );
    }
    return response.data.ableToPlay;
  } catch (error) {
    showError(error);
    console.error("Internal error: ", error);
    return false;
  }
};

export const isUserAbleToLeague = async (): Promise<boolean> => {
  try {
    const response = await api.get("/user/isUserAbleToLeague/", {
      headers: authHeader(),
    });
    return response.data.ableToPlay;
  } catch (error) {
    showError(error);
    console.error("Internal error: ", error);
    return false;
  }
};

export const saveAvatar = async (
  image: string,
  avatarOptions: AvatarOptions
) => {
  try {
    await api.post(
      "/user/saveAvatar/",
      { image, avatarOptions },
      { headers: authHeader() }
    );
    toast.success("Avatar updated");
  } catch (error) {
    showError(error);
    console.error("Internal error: ", error);
    return false;
  }
};

export const getAvatarOptions = async (): Promise<AvatarOptions | null> => {
  try {
    const response = await api.get("/user/getAvatarOptions/", {
      headers: authHeader(),
    });
    return response.data.avatarOptions;
  } catch (error) {
    showError(error);
    console.error("Internal error: ", error);
    return null;
  }
};

export const getUserAccessories = async (): Promise<Accessories | null> => {
  try {
    const response = await api.get("/user/getAccessories/", {
      headers: authHeader(),
    });
    return JSON.parse(response.data.accessories);
  } catch (error) {
    showError(error);
    console.error("Internal error: ", error);
    return null;
  }
};

export const getAccessoryInfo = async (
  code: string
): Promise<AccessoryInfo> => {
  try {
    const response = await api.get(`/accessory/getAccessory/${code}`, {
      headers: authHeader(),
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching accessory info: ", error);
    throw error;
  }
};

export const getUserStats = async (): Promise<UserStats> => {
  try {
    const response = await api.get(`/user/getUserStats`, {
      headers: authHeader(),
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching accessory info: ", error);
    throw error;
  }
};

export const getPokemonLaboratory = async (): Promise<TrainerPokemon[]> => {
  try {
    const response = await api.get(`/user/allPokemonLaboratory`, {
      headers: authHeader(),
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching accessory info: ", error);
    throw error;
  }
};

export const getMergeResults = async (
  firstPokemonId: number,
  secondPokemonId: number
): Promise<string[]> => {
  try {
    const response = await api.post(
      `/trainerPokemon/getMergeResults`,
      { firstPokemonId, secondPokemonId },
      {
        headers: authHeader(),
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching merge results: ", error);
    showError(error);
    throw error;
  }
};

export const mergePokemon = async (
  firstPokemonId: number,
  secondPokemonId: number
): Promise<TrainerPokemon> => {
  try {
    const response = await api.post(
      `/trainerPokemon/merge`,
      { firstPokemonId, secondPokemonId },
      {
        headers: authHeader(),
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error during the merge process:", error);
    showError(error);
    throw error;
  }
};

export const getLeagueTeam = async (): Promise<TeamData | null> => {
  try {
    const response = await api.get(`/user/getLeagueTeam`, {
      headers: authHeader(),
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching accessory info: ", error);
    throw error;
  }
};

export const getLeagueLevel = async (
  levelId: string
): Promise<LeagueLevel | null> => {
  try {
    const response = await api.get(`/user/getLeagueLevel/${levelId}`, {
      headers: authHeader(),
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching accessory info: ", error);
    throw error;
  }
};

export const createLeagueTeam = async (
  trainerPokemonIds: number[]
): Promise<TrainerPokemon> => {
  try {
    const response = await api.post(
      `/user/createLeagueTeam`,
      { trainerPokemonIds },
      {
        headers: authHeader(),
      }
    );
    return response.data;
  } catch (error) {
    showError(error);
    console.error("Error during the merge process:", error);
    throw error;
  }
};

export const getLeagueLevels = async (): Promise<LeagueLevel[]> => {
  try {
    const response = await api.get(`/user/getLeagueLevels`, {
      headers: authHeader(),
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching accessory info: ", error);
    throw error;
  }
};

export const unlockLeagueChampion = async (): Promise<boolean> => {
  try {
    const response = await api.get(`/user/unlockLeagueChampion`, {
      headers: authHeader(),
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching accessory info: ", error);
    throw error;
  }
};

const showError = (error: any) => {
  if (typeof error === "object" && (error as any).response?.data?.error) {
    const errorMessage = (error as any).response.data.error;
    toast.error(errorMessage);
  } else {
    toast.error("An unknown error occurred");
  }
};

// Level Time Tracking API functions
export const startLevelTimeTracking = async (
  levelNumber: number,
  levelType: 'game' | 'league' = 'game'
): Promise<any> => {
  try {
    const response = await api.post('/levelTime/start', 
      { levelNumber, levelType },
      { headers: authHeader() }
    );
    return response.data;
  } catch (error) {
    showError(error);
    console.error("Error starting level time tracking: ", error);
    return null;
  }
};

export const completeLevelTimeTracking = async (
  levelNumber: number,
  levelType: 'game' | 'league' = 'game'
): Promise<any> => {
  try {
    const response = await api.post('/levelTime/complete', 
      { levelNumber, levelType },
      { headers: authHeader() }
    );
    return response.data;
  } catch (error) {
    showError(error);
    console.error("Error completing level time tracking: ", error);
    return null;
  }
};

export const getLevelTimeStats = async (): Promise<any> => {
  try {
    const response = await api.get('/levelTime/stats', {
      headers: authHeader()
    });
    return response.data;
  } catch (error) {
    showError(error);
    console.error("Error fetching level time stats: ", error);
    return null;
  }
};

export const getLevelTimeHistory = async (): Promise<any> => {
  try {
    const response = await api.get('/levelTime/history', {
      headers: authHeader()
    });
    return response.data;
  } catch (error) {
    showError(error);
    console.error("Error fetching level time history: ", error);
    return null;
  }
};

export const getLevelTimeTypeStats = async (): Promise<any> => {
  try {
    const response = await api.get('/levelTime/typeStats', {
      headers: authHeader()
    });
    return response.data;
  } catch (error) {
    showError(error);
    console.error("Error fetching level time type stats: ", error);
    return null;
  }
};

export const getLevelStartTime = async (
  levelNumber: number,
  levelType: 'game' | 'league' = 'game'
): Promise<any> => {
  try {
    const response = await api.get(
      `/levelTime/startTime?levelNumber=${levelNumber}&levelType=${levelType}`,
      { headers: authHeader() }
    );
    return response.data;
  } catch (error) {
    showError(error);
    console.error("Error fetching level start time: ", error);
    return null;
  }
};

// Leaderboard API functions
export const getGameLevelsLeaderboard = async (): Promise<any> => {
  try {
    const response = await api.get('/levelTime/gameLeaderboard', {
      headers: authHeader()
    });
    return response.data;
  } catch (error) {
    showError(error);
    console.error("Error fetching game levels leaderboard: ", error);
    return null;
  }
};

export const getLeagueLeaderboard = async (): Promise<any> => {
  try {
    const response = await api.get('/levelTime/leagueLeaderboard', {
      headers: authHeader()
    });
    return response.data;
  } catch (error) {
    showError(error);
    console.error("Error fetching league leaderboard: ", error);
    return null;
  }
};

export const getLevelLeaderboard = async (
  levelNumber: number,
  levelType: 'game' | 'league' = 'game'
): Promise<any> => {
  try {
    const response = await api.get(
      `/levelTime/levelLeaderboard?levelNumber=${levelNumber}&levelType=${levelType}`,
      { headers: authHeader() }
    );
    return response.data;
  } catch (error) {
    showError(error);
    console.error("Error fetching level leaderboard: ", error);
    return null;
  }
};

export const getCurrentUserRanking = async (
  levelType: 'game' | 'league' = 'game'
): Promise<any> => {
  try {
    const response = await api.get(
      `/levelTime/currentUserRanking?levelType=${levelType}`,
      { headers: authHeader() }
    );
    return response.data;
  } catch (error) {
    showError(error);
    console.error("Error fetching current user ranking: ", error);
    return null;
  }
};
