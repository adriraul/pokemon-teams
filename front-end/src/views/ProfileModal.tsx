import React from "react";
import { Modal, Button } from "react-bootstrap";
import { useAppSelector } from "../hooks/redux/hooks";
import { RootState } from "../store";
import { useNavigate } from "react-router-dom";
import "./styles/ProfileStyles.css";

interface ProfileModalProps {
  show: boolean;
  handleClose: () => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ show, handleClose }) => {
  const navigate = useNavigate();
  const username = useAppSelector((state: RootState) => state.auth.username);
  const avatar = useAppSelector((state: RootState) => state.auth.avatar);
  const badgesUnlocked = useAppSelector(
    (state: RootState) => state.auth.badgesUnlocked
  );

  const handleCustomizeAvatar = () => {
    navigate("/customize-avatar");
    handleClose();
  };

  const parseBadgesUnlocked = (badgesString: string) => {
    return badgesString.split(",").reduce((acc, badge) => {
      const [id, unlocked] = badge.split(":").map(Number);
      acc[id] = unlocked === 1;
      return acc;
    }, {} as Record<number, boolean>);
  };

  const badges = badgesUnlocked ? parseBadgesUnlocked(badgesUnlocked) : {};

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
    <Modal show={show} onHide={handleClose} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title className="modal-profile-title">
          {`${username} trainer's profile`}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="profile-info">
          <div className="profile-avatar-container">
            <img
              src={avatar || "images/avatar/default-avatar.png"}
              alt="User Avatar"
              className="profile-avatar"
            />
            <Button onClick={handleCustomizeAvatar}>Customize</Button>
          </div>
          <div className="profile-details">
            <div className="medals-container">
              <h4 className="medals-title">Medals</h4>
              <div className="medals">
                {Object.entries(badgeTypes).map(([id, badgeType]) => (
                  <div
                    key={id}
                    className={`medal ${badgeType}`}
                    style={{
                      filter: badges[Number(id)] ? "none" : "brightness(0)",
                    }}
                  >
                    <img
                      src={`/images/elements/medals/${badgeType}.png`}
                      alt={`${badgeType} medal`}
                      className="medal-icon"
                    />
                    <div className="medal-label">
                      {badgeType.charAt(0).toUpperCase() + badgeType.slice(1)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="stats-container">
              <h4 className="stats-title">Stats</h4>
              <div className="stats"></div>
              {/* Add statistics here */}
            </div>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default ProfileModal;
