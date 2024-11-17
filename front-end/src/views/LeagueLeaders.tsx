import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getLeagueLevels, LeagueLevel } from "../services/api";
import { Container } from "react-bootstrap";
import "./styles/LeagueLeaders.css";

const LeagueLeaders: React.FC = () => {
  const [leagueLevels, setLeagueLevels] = useState<LeagueLevel[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLeagueLevels = async () => {
      const levels = await getLeagueLevels();
      setLeagueLevels(levels);
    };

    fetchLeagueLevels();
  }, []);

  const isLevelClickable = (level: LeagueLevel) => {
    return !level.passed && !level.blocked;
  };

  const handleLevelClick = (level: LeagueLevel) => {
    if (isLevelClickable(level)) {
      navigate(`/league/${level.id}`);
    }
  };

  return (
    <Container className="league-leaders-container">
      <h1 className="text-center mt-5">League Leaders</h1>
      <div className="league-leaders-grid">
        {leagueLevels.slice(0, 4).map((level, index) => (
          <div
            key={level.id}
            className={`league-leader-wrapper corner-${index + 1}`}
          >
            <div
              className={`league-leader-card ${
                isLevelClickable(level) ? "clickable" : "non-clickable"
              }`}
              onClick={() => handleLevelClick(level)}
            >
              {level.passed && (
                <div className="league-passed-icon">
                  <img src="/images/elements/buttons/check.png" alt="Passed" />
                </div>
              )}
              <img
                src={`/images/league/${level.leaderName
                  .toLowerCase()
                  .replace(/ /g, "-")}.png`}
                alt={level.leaderName}
                className="league-leader-image"
              />
            </div>
          </div>
        ))}
        {leagueLevels.length === 5 && (
          <div className="league-leader-wrapper champion">
            <div
              className={`league-leader-card league-champion-card ${
                isLevelClickable(leagueLevels[4])
                  ? "clickable"
                  : "non-clickable"
              }`}
              onClick={() => handleLevelClick(leagueLevels[4])}
            >
              {leagueLevels[4].passed && (
                <div className="league-passed-icon">
                  <img src="/images/elements/buttons/check.png" alt="Passed" />
                </div>
              )}
              <img
                src={`/images/league/${leagueLevels[4].leaderName
                  .toLowerCase()
                  .replace(/ /g, "-")}.png`}
                alt={leagueLevels[4].leaderName}
                className="league-leader-image"
              />
            </div>
          </div>
        )}
      </div>
    </Container>
  );
};

export default LeagueLeaders;
