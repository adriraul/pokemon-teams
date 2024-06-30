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

  const handleCustomizeAvatar = () => {
    navigate("/customize-avatar");
    handleClose();
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
                <div className="medal silver">
                  <div className="medal-icon"></div>
                  <div className="medal-label">Silver</div>
                </div>
                <div className="medal gold">
                  <div className="medal-icon"></div>
                  <div className="medal-label">Gold</div>
                </div>
                <div className="medal platinum">
                  <div className="medal-icon"></div>
                  <div className="medal-label">Platinum</div>
                </div>
                <div className="medal ruby">
                  <div className="medal-icon"></div>
                  <div className="medal-label">Ruby</div>
                </div>
                <div className="medal sapphire">
                  <div className="medal-icon"></div>
                  <div className="medal-label">Sapphire</div>
                </div>
                <div className="medal emerald">
                  <div className="medal-icon"></div>
                  <div className="medal-label">Emerald</div>
                </div>
                <div className="medal pearl">
                  <div className="medal-icon"></div>
                  <div className="medal-label">Pearl</div>
                </div>
                <div className="medal diamond">
                  <div className="medal-icon"></div>
                  <div className="medal-label">Diamond</div>
                </div>
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
