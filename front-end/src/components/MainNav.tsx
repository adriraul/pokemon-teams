import React, { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import { FaUser } from "react-icons/fa";
import { useAppDispatch, useAppSelector } from "../hooks/redux/hooks";
import { RootState } from "../store";
import { logoutSuccess, updateBalance } from "../services/auth/authSlice";
import Dropdown from "react-bootstrap/Dropdown";
import { redeemCode } from "../services/api";
import { Button, Form, Modal } from "react-bootstrap";
import ProfileModal from "../views/ProfileModal";

const MainNav: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [showModalRedeemCode, setShowModalRedeemCode] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [code, setCode] = useState("");

  const balance = useAppSelector((state: RootState) => state.auth.balance);
  const avatar = useAppSelector((state: RootState) => state.auth.avatar);

  const isAuthenticated = useAppSelector(
    (state: RootState) => state.auth.isAuthenticated
  );

  const handleLogout = () => {
    dispatch(logoutSuccess());
    navigate("/login");
  };

  const handleModalRedeemCode = () => {
    setCode("");
    setShowModalRedeemCode(true);
  };

  const handleRedeemCode = async () => {
    const response = await redeemCode(code);
    if (response) dispatch(updateBalance(response.newBalance));
    setShowModalRedeemCode(false);
  };

  return (
    <>
      <Navbar bg="dark" data-bs-theme="dark">
        <Container>
          <Navbar.Brand href="/">PokeTeams</Navbar.Brand>
          <Nav className="me-auto">
            <Nav.Link href="/pokedex">Pokedex</Nav.Link>
            <Nav.Link href="/game">Play</Nav.Link>
            <Nav.Link href="/pokemon">Pokemon</Nav.Link>
            <Nav.Link href="/laboratory">Laboratory</Nav.Link>
            <Nav.Link href="/pokeballs">Pokeballs</Nav.Link>
          </Nav>
          <Nav>
            {isAuthenticated && (
              <Nav.Item className="nav-link">{balance}$</Nav.Item>
            )}
            {isAuthenticated ? (
              <Dropdown>
                <Dropdown.Toggle
                  variant="secondary"
                  id="dropdown-basic"
                  style={{
                    padding: 0,
                    border: "none",
                    backgroundColor: "transparent",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  {avatar && avatar !== "null" && avatar !== "" ? (
                    <img
                      src={avatar}
                      alt="User Avatar"
                      style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "50%",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <FaUser style={{ width: "40px", height: "40px" }} />
                  )}
                </Dropdown.Toggle>

                <Dropdown.Menu>
                  <Dropdown.Item onClick={() => setShowProfile(true)}>
                    Profile
                  </Dropdown.Item>
                  <Dropdown.Item onClick={handleModalRedeemCode}>
                    Redeem Code
                  </Dropdown.Item>
                  <Dropdown.Divider />
                  <Dropdown.Item onClick={handleLogout}>Logout</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            ) : (
              <Nav.Link href="/login">
                <FaUser />
              </Nav.Link>
            )}
          </Nav>
        </Container>
      </Navbar>

      <ProfileModal
        show={showProfile}
        handleClose={() => setShowProfile(false)}
      />

      <Modal
        show={showModalRedeemCode}
        onHide={() => setShowModalRedeemCode(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Redeem Code</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Control
            type="text"
            className="searchInputBackground"
            placeholder="Enter your code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowModalRedeemCode(false)}
          >
            Cancel
          </Button>
          <Button variant="primary" onClick={handleRedeemCode}>
            Redeem
          </Button>
        </Modal.Footer>
      </Modal>

      <Outlet />
    </>
  );
};

export default MainNav;
