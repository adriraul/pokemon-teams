import React, { useState } from "react";
import { Outlet, useNavigate, NavLink } from "react-router-dom";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import { FaBook, FaGamepad, FaTrophy, FaFlask, FaUser } from "react-icons/fa";
import { BsBagFill } from "react-icons/bs";
import { MdCatchingPokemon } from "react-icons/md";
import Dropdown from "react-bootstrap/Dropdown";
import { Button, Form, Modal } from "react-bootstrap";
import ProfileModal from "../views/ProfileModal";
import { useAppDispatch, useAppSelector } from "../hooks/redux/hooks";
import { RootState } from "../store";
import { logoutSuccess, updateBalance } from "../services/auth/authSlice";
import { redeemCode } from "../services/api";
import "./styles/MainNav.css";

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
      <Navbar className="custom-navbar" expand="lg">
        <Container>
          <Navbar.Brand href="/" className="brand-logo">
            <img
              src="/images/elements/mainnav/pokeball-icon.png"
              alt="PokeTeams Logo"
              className="brand-icon"
            />
            PokeTeams
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="custom-nav">
              <NavLink
                to="/pokedex"
                className={({ isActive }) =>
                  `nav-link ${isActive ? "active" : ""}`
                }
              >
                <FaBook className="nav-icon" />
                Pokedex
              </NavLink>
              <NavLink
                to="/game"
                className={({ isActive }) =>
                  `nav-link ${isActive ? "active" : ""}`
                }
              >
                <FaGamepad className="nav-icon" />
                Play
              </NavLink>
              <NavLink
                to="/league"
                className={({ isActive }) =>
                  `nav-link ${isActive ? "active" : ""}`
                }
              >
                <FaTrophy className="nav-icon" />
                League
              </NavLink>
              <NavLink
                to="/pokemon"
                className={({ isActive }) =>
                  `nav-link ${isActive ? "active" : ""}`
                }
              >
                <MdCatchingPokemon className="nav-icon" />
                Pokemon
              </NavLink>
              <NavLink
                to="/laboratory"
                className={({ isActive }) =>
                  `nav-link ${isActive ? "active" : ""}`
                }
              >
                <FaFlask className="nav-icon" />
                Laboratory
              </NavLink>
              <NavLink
                to="/pokeballs"
                className={({ isActive }) =>
                  `nav-link ${isActive ? "active" : ""}`
                }
              >
                <BsBagFill className="nav-icon" />
                Pokeballs
              </NavLink>
            </Nav>
            <Nav className="ms-auto align-items-center">
              {isAuthenticated && (
                <div className="balance-chip">
                  <span>{balance}$</span>
                </div>
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
                        className="user-avatar"
                      />
                    ) : (
                      <img
                        src="/images/avatar/default-avatar.png"
                        alt="Default Avatar"
                        className="user-avatar"
                      />
                    )}
                  </Dropdown.Toggle>

                  <Dropdown.Menu className="dropdown-menu-custom">
                    <Dropdown.Item onClick={() => setShowProfile(true)}>
                      Profile
                    </Dropdown.Item>
                    <Dropdown.Item onClick={() => navigate("/leaderboard")}>
                      Leaderboard
                    </Dropdown.Item>
                    <Dropdown.Item onClick={handleModalRedeemCode}>
                      Redeem Code
                    </Dropdown.Item>
                    <Dropdown.Divider />
                    <Dropdown.Item onClick={handleLogout}>Logout</Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              ) : (
                <NavLink to="/login" className="nav-link">
                  <FaUser style={{ color: "white" }} />
                </NavLink>
              )}
            </Nav>
          </Navbar.Collapse>
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
