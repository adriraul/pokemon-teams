import React, { useState } from "react";
import { Container, Form, Button, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { login } from "../services/auth";

const Login: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (!username || !password) {
      setError("Todos los campos son obligatorios");
      return;
    }

    setError("");

    try {
      const response = await login(username, password);
      console.log("Login successful", response);
      setError("");
    } catch (error) {
      setError("Error al iniciar sesión");
    }
  };

  const handleRegister = () => {
    navigate("/register");
  };

  return (
    <Container className="align-items-center justify-content-center mt-3 pb-4 px-5 bg-dark text-light rounded">
      <h2 className="mb-4 pt-4 px-2">Iniciar sesión</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      <Form>
        <Form.Group className="mb-3" controlId="formBasicUsername">
          <Form.Label>Nombre de usuario</Form.Label>
          <Form.Control
            type="text"
            className="searchInputBackground"
            placeholder="Inserta el nombre de usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="formBasicPassword">
          <Form.Label>Contraseña</Form.Label>
          <Form.Control
            type="password"
            className="searchInputBackground"
            placeholder="Inserta la contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Form.Group>

        <Button variant="secondary" type="button" onClick={handleLogin}>
          Login
        </Button>

        <Button
          variant="secondary"
          type="button"
          onClick={handleRegister}
          className="ms-2"
        >
          Register
        </Button>
      </Form>
    </Container>
  );
};

export default Login;
