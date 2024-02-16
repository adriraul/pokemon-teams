import React from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import { FaSignOutAlt, FaUser } from "react-icons/fa";
import { useAppDispatch, useAppSelector } from "../hooks/redux/hooks";
import { RootState } from "../store";
import { logoutSuccess } from "../services/auth/authSlice";

const MainNav: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const isAuthenticated = useAppSelector(
    (state: RootState) => state.auth.isAuthenticated
  );

  const handleLogout = () => {
    dispatch(logoutSuccess());
    navigate("/pokedex");
  };

  return (
    <>
      <Navbar bg="dark" data-bs-theme="dark">
        <Container>
          <Navbar.Brand href="/">Pokemon Teams</Navbar.Brand>
          <Nav className="me-auto">
            <Nav.Link href="/pokedex">Pokedex</Nav.Link>
            <Nav.Link href="/boxes">Boxes</Nav.Link>
            <Nav.Link href="/teams">Teams</Nav.Link>
          </Nav>
          <Nav>
            {isAuthenticated ? (
              <Nav.Link onClick={handleLogout}>
                <FaSignOutAlt />
              </Nav.Link>
            ) : (
              <Nav.Link href="/login">
                <FaUser />
              </Nav.Link>
            )}
          </Nav>
        </Container>
      </Navbar>

      <Outlet />
    </>
  );
};

export default MainNav;
