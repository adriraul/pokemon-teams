import React, { useState, useEffect } from "react";
import { Button } from "react-bootstrap";
import ReactConfetti from "react-confetti";
import { GameLevel, getAccessoryInfo, LeagueLevel } from "../services/api";
import "./styles/RewardClaimStyles.css";

interface RewardClaimProps {
  level: GameLevel | LeagueLevel;
  handleClaimReward: () => void;
  isClaimed: boolean;
}

const RewardClaim: React.FC<RewardClaimProps> = ({
  level,
  handleClaimReward,
  isClaimed,
}) => {
  const [accessoryInfo, setAccessoryInfo] = useState<any | null>(null);

  useEffect(() => {
    if (level.unlocksAccessoryId) {
      const fetchAccessoryInfo = async () => {
        try {
          const info = await getAccessoryInfo(level.unlocksAccessoryId);
          setAccessoryInfo(info);
        } catch (error) {
          console.error("Error fetching accessory info:", error);
        }
      };

      fetchAccessoryInfo();
    }
  }, [level.unlocksAccessoryId]);

  const renderBadge = () => {
    if (!level.badgeWonId) return null;

    const badgeTypes: { [key: number]: string } = {
      1: "silver",
      2: "gold",
      3: "pearl",
      4: "ruby",
      5: "sapphire",
      6: "emerald",
      7: "platinum",
      8: "diamond",
    };

    return (
      <div className={`badge-won ${badgeTypes[level.badgeWonId]}`}>
        <img
          src={`/images/elements/medals/${badgeTypes[level.badgeWonId]}.png`}
          alt={`${badgeTypes[level.badgeWonId]} medal`}
          className="medal-icon"
        />
      </div>
    );
  };

  return (
    <div className="reward-claim-container">
      <ReactConfetti />
      <div className="reward-message">¡Has ganado!</div>
      <div className="reward-amount">Recompensa: {level.reward} $</div>
      {accessoryInfo && (
        <div className="accessory-info">
          <div className="accessory-details">
            <div className="accessory-name">{`Has desbloqueado el accesorio ${accessoryInfo.name}`}</div>
            <div className="accessory-description">
              {accessoryInfo.description}
            </div>
          </div>
        </div>
      )}
      {renderBadge()}
      <Button
        className="mt-3 claim-button"
        onClick={handleClaimReward}
        disabled={isClaimed}
      >
        {isClaimed ? "Reward Claimed" : "Claim Reward"}
      </Button>
    </div>
  );
};

export default RewardClaim;
