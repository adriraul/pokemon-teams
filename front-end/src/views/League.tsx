import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getLeagueTeam } from "../services/api";

const League: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkLeagueTeam = async () => {
      const team = await getLeagueTeam();
      if (team) {
        navigate("/league/leaders");
      } else {
        navigate("/league/team-selection");
      }
    };

    checkLeagueTeam();
  }, [navigate]);

  return <div>Loading...</div>;
};

export default League;
