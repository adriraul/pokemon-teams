import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getLeagueTeam, isUserAbleToLeague } from "../services/api";
import { Modal, Button } from "react-bootstrap";

const League: React.FC = () => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const checkLeagueAccess = async () => {
      const hasAccess = await isUserAbleToLeague();

      if (!hasAccess) {
        setShowModal(true);
        return;
      }

      const team = await getLeagueTeam();
      if (team) {
        navigate("/league/leaders");
      } else {
        navigate("/league/team-selection");
      }
    };

    checkLeagueAccess();
  }, [navigate]);

  const handleCloseModal = () => {
    setShowModal(false);
    navigate("/game");
  };

  return (
    <>
      <div>Loading...</div>
      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Access Denied</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          You need to complete all levels before accessing the league.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={handleCloseModal}>
            OK
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default League;
