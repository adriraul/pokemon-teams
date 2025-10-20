import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Badge,
  Form,
  Button,
} from "react-bootstrap";
import {
  FaTrophy,
  FaMedal,
  FaCrown,
  FaGamepad,
  FaTrophy as FaTrophyIcon,
} from "react-icons/fa";
import { useLevelTimeTracking } from "../hooks/useLevelTimeTracking";
import { useAppSelector } from "../hooks/redux/hooks";
import {
  getGameLevelsLeaderboard,
  getLeagueLeaderboard,
  getLevelLeaderboard,
  getCurrentUserRanking,
} from "../services/api";
import "./styles/Leaderboard.css";

interface LeaderboardEntry {
  username: string;
  timeSpentSeconds: number;
  rank: number;
  isCurrentUser: boolean;
}

interface LevelLeaderboard {
  levelNumber: number;
  levelType: string;
  entries: LeaderboardEntry[];
}

export const Leaderboard: React.FC = () => {
  const [gameRanking, setGameRanking] = useState<LeaderboardEntry[]>([]);
  const [leagueRanking, setLeagueRanking] = useState<LeaderboardEntry[]>([]);
  const [levelRankings, setLevelRankings] = useState<LevelLeaderboard[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<number>(1);
  const [selectedLevelType, setSelectedLevelType] = useState<"game" | "league">(
    "game"
  );
  const [loading, setLoading] = useState(false);

  const { getUserStats, getUserHistory, getLevelTypeStats, formatTime } =
    useLevelTimeTracking();
  const currentUser = useAppSelector((state) => state.auth.username);

  useEffect(() => {
    loadLeaderboards();
  }, []);

  const loadLeaderboards = async () => {
    setLoading(true);
    try {
      // Cargar rankings generales
      await loadGameRanking();
      await loadLeagueRanking();
      await loadLevelRankings();
    } catch (error) {
      console.error("Error loading leaderboards:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadGameRanking = async () => {
    try {
      const response = await getGameLevelsLeaderboard();
      if (response && response.leaderboard) {
        const leaderboardData = response.leaderboard.map(
          (entry: any, index: number) => ({
            username: entry.username,
            timeSpentSeconds: entry.totalTime,
            rank: index + 1,
            isCurrentUser: currentUser
              ? entry.username.toLowerCase() === currentUser.toLowerCase()
              : false,
          })
        );


        const currentUserEntry = await getCurrentUserRanking("game");
        const isUserAlreadyInTop5 = leaderboardData.find(
          (entry: LeaderboardEntry) => {
            return currentUser
              ? entry.username.toLowerCase() === currentUser.toLowerCase()
              : false;
          }
        );

        if (
          currentUserEntry &&
          currentUserEntry.ranking &&
          currentUserEntry.ranking.completedLevels === 31 &&
          !isUserAlreadyInTop5
        ) {
          leaderboardData.push({
            username: currentUser || "You",
            timeSpentSeconds: currentUserEntry.ranking.totalTime,
            rank: leaderboardData.length + 1,
            isCurrentUser: true,
          });
        }

        setGameRanking(leaderboardData);
      }
    } catch (error) {
      console.error("Error loading game ranking:", error);
    }
  };

  const loadLeagueRanking = async () => {
    try {
      const response = await getLeagueLeaderboard();
      if (response && response.leaderboard) {
        const leaderboardData = response.leaderboard.map(
          (entry: any, index: number) => ({
            username: entry.username,
            timeSpentSeconds: entry.totalTime,
            rank: index + 1,
            isCurrentUser: currentUser
              ? entry.username.toLowerCase() === currentUser.toLowerCase()
              : false,
          })
        );


        const currentUserEntry = await getCurrentUserRanking("league");
        const isUserAlreadyInTop5 = leaderboardData.find(
          (entry: LeaderboardEntry) => {
            return currentUser
              ? entry.username.toLowerCase() === currentUser.toLowerCase()
              : false;
          }
        );

        if (
          currentUserEntry &&
          currentUserEntry.ranking &&
          currentUserEntry.ranking.completedLevels > 0 &&
          !isUserAlreadyInTop5
        ) {
          leaderboardData.push({
            username: currentUser || "You",
            timeSpentSeconds: currentUserEntry.ranking.totalTime,
            rank: leaderboardData.length + 1,
            isCurrentUser: true,
          });
        }

        setLeagueRanking(leaderboardData);
      }
    } catch (error) {
      console.error("Error loading league ranking:", error);
    }
  };

  const loadLevelRankings = async () => {
    try {
      const response = await getLevelLeaderboard(
        selectedLevel,
        selectedLevelType
      );
      if (response && response.leaderboard) {
        const levelData = response.leaderboard.map(
          (entry: any, index: number) => ({
            username: entry.username,
            timeSpentSeconds: entry.timeSpent,
            rank: index + 1,
            isCurrentUser: entry.username === currentUser,
          })
        );

        setLevelRankings([
          {
            levelNumber: selectedLevel,
            levelType: selectedLevelType,
            entries: levelData,
          },
        ]);
      } else {
        setLevelRankings([]);
      }
    } catch (error) {
      console.error("Error loading level rankings:", error);
      setLevelRankings([]);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <FaCrown className="rank-icon gold" />;
      case 2:
        return <FaMedal className="rank-icon silver" />;
      case 3:
        return <FaMedal className="rank-icon bronze" />;
      default:
        return <span className="rank-number">{rank}</span>;
    }
  };

  const getCurrentLevelRanking = () => {
    const levelRanking = levelRankings.find(
      (lr) =>
        lr.levelNumber === selectedLevel && lr.levelType === selectedLevelType
    );
    return levelRanking?.entries || [];
  };

  const loadSelectedLevelRanking = async () => {
    try {
      const response = await getLevelLeaderboard(
        selectedLevel,
        selectedLevelType
      );
      if (response && response.leaderboard) {
        const levelData = response.leaderboard.map(
          (entry: any, index: number) => ({
            username: entry.username,
            timeSpentSeconds: entry.timeSpent,
            rank: index + 1,
            isCurrentUser: entry.username === currentUser,
          })
        );

        setLevelRankings([
          {
            levelNumber: selectedLevel,
            levelType: selectedLevelType,
            entries: levelData,
          },
        ]);
      } else {
        setLevelRankings([]);
      }
    } catch (error) {
      console.error("Error loading selected level ranking:", error);
      setLevelRankings([]);
    }
  };

  // Recargar ranking cuando cambie el nivel seleccionado
  useEffect(() => {
    loadSelectedLevelRanking();
  }, [selectedLevel, selectedLevelType]);

  if (loading) {
    return (
      <Container className="leaderboard-container">
        <div className="loading-spinner">Loading...</div>
      </Container>
    );
  }

  return (
    <Container className="leaderboard-container">
      <Row className="mb-4">
        <Col>
          <h1 className="leaderboard-title">
            <FaTrophyIcon className="title-icon" />
            Leaderboard
          </h1>
          <div className="text-center text-white mb-3">
            <p className="leaderboard-description">
              Compete for the best times in game levels and leagues. Only users
              who have completed all corresponding levels are shown.
            </p>
          </div>
        </Col>
      </Row>

      {/* Rankings Generales */}
      <Row className="mb-4">
        <Col md={6}>
          <Card className="ranking-card">
            <Card.Header className="ranking-header">
              <FaGamepad className="header-icon" />
              <h3>Game Levels Ranking</h3>
              <p>
                Top 5 - All 31 Levels (Only users who have completed all levels)
              </p>
            </Card.Header>
            <Card.Body>
              {gameRanking.length > 0 ? (
                <Table className="ranking-table">
                  <thead>
                    <tr>
                      <th>Rank</th>
                      <th>Player</th>
                      <th>Total Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {gameRanking.map((entry, index) => (
                      <tr
                        key={index}
                        className={
                          entry.isCurrentUser ? "current-user-row" : ""
                        }
                      >
                        <td className="rank-cell">{getRankIcon(entry.rank)}</td>
                        <td className="player-cell">
                          {entry.username}
                          {entry.isCurrentUser && (
                            <Badge bg="primary" className="ms-2">
                              You
                            </Badge>
                          )}
                        </td>
                        <td className="time-cell">
                          {formatTime(entry.timeSpentSeconds)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <div className="text-center p-3 text-white">
                  <p>No users have completed all 31 game levels.</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card className="ranking-card">
            <Card.Header className="ranking-header">
              <FaTrophy className="header-icon" />
              <h3>League Ranking</h3>
              <p>
                Top 5 - League Champions (Only users who have completed league
                levels)
              </p>
            </Card.Header>
            <Card.Body>
              {leagueRanking.length > 0 ? (
                <Table className="ranking-table">
                  <thead>
                    <tr>
                      <th>Rank</th>
                      <th>Player</th>
                      <th>Total Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leagueRanking.map((entry, index) => (
                      <tr
                        key={index}
                        className={
                          entry.isCurrentUser ? "current-user-row" : ""
                        }
                      >
                        <td className="rank-cell">{getRankIcon(entry.rank)}</td>
                        <td className="player-cell">
                          {entry.username}
                          {entry.isCurrentUser && (
                            <Badge bg="primary" className="ms-2">
                              You
                            </Badge>
                          )}
                        </td>
                        <td className="time-cell">
                          {formatTime(entry.timeSpentSeconds)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <div className="text-center p-3 text-white">
                  <p>No users have completed league levels.</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Ranking por Nivel Individual */}
      <Row>
        <Col>
          <Card className="ranking-card">
            <Card.Header className="ranking-header">
              <h3>Individual Level Rankings</h3>
              <p>Select a level to see the top 5 players</p>
            </Card.Header>
            <Card.Body>
              <Row className="mb-3">
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Level Type:</Form.Label>
                    <select
                      value={selectedLevelType}
                      onChange={(e) => {
                        setSelectedLevelType(
                          e.target.value as "game" | "league"
                        );
                      }}
                      className="level-selector"
                      style={{
                        background: "rgba(51, 50, 50, 0.9)",
                        border: "2px solid #58151c",
                        color: "white",
                        borderRadius: "8px",
                        padding: "0.5rem",
                        fontSize: "0.9rem",
                        display: "block",
                        width: "100%",
                        minHeight: "40px",
                      }}
                    >
                      <option value="game">Game Level</option>
                      <option value="league">League Level</option>
                    </select>
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Level Number:</Form.Label>
                    <select
                      value={selectedLevel}
                      onChange={(e) => {
                        setSelectedLevel(Number(e.target.value));
                      }}
                      className="level-selector"
                      style={{
                        background: "rgba(51, 50, 50, 0.9)",
                        border: "2px solid #58151c",
                        color: "white",
                        borderRadius: "8px",
                        padding: "0.5rem",
                        fontSize: "0.9rem",
                        display: "block",
                        width: "100%",
                        minHeight: "40px",
                      }}
                    >
                      {Array.from(
                        { length: selectedLevelType === "game" ? 31 : 5 },
                        (_, i) => i + 1
                      ).map((num) => (
                        <option key={num} value={num}>
                          Level {num}
                        </option>
                      ))}
                    </select>
                  </Form.Group>
                </Col>
              </Row>

              {getCurrentLevelRanking().length > 0 ? (
                <Table className="ranking-table">
                  <thead>
                    <tr>
                      <th>Rank</th>
                      <th>Player</th>
                      <th>Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getCurrentLevelRanking().map((entry, index) => (
                      <tr
                        key={index}
                        className={
                          entry.isCurrentUser ? "current-user-row" : ""
                        }
                      >
                        <td className="rank-cell">{getRankIcon(entry.rank)}</td>
                        <td className="player-cell">
                          {entry.username}
                          {entry.isCurrentUser && (
                            <Badge bg="primary" className="ms-2">
                              You
                            </Badge>
                          )}
                        </td>
                        <td className="time-cell">
                          {formatTime(entry.timeSpentSeconds)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <div className="text-center p-3 text-white">
                  <p>No users have completed this level.</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Leaderboard;
