import React from "react";
import { Outlet } from "react-router-dom";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";

const MainNav: React.FC = () => {
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
        </Container>
      </Navbar>

      <Outlet />
    </>
  );
};

export default MainNav;
