import React, { useState } from "react";
import { Alert, Button, Container, Form } from "react-bootstrap";
import { register } from "../services/auth";
import { useNavigate } from "react-router-dom";

const Register: React.FC = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleRegister = async () => {
    if (!username || !email || !password) {
      setError("Todos los campos son obligatorios");
      return;
    }

    setError("");

    try {
      await register(username, email, password);
      navigate("/login");
    } catch (error) {
      setError("Error al iniciar sesión");
    }
  };

  return (
    <Container className="align-items-center justify-content-center mt-3 pb-4 px-5 bg-dark text-light rounded">
      <h2 className="mb-4 pt-4 px-2">Registro</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      <Form>
        <Form.Group className="mb-3" controlId="formBasicUsername">
          <Form.Label>Nombre de usuario</Form.Label>
          <Form.Control
            type="text"
            className="searchInputBackground"
            placeholder="Enter username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="formBasicEmail">
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="email"
            className="searchInputBackground"
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="formBasicPassword">
          <Form.Label>Contraseña</Form.Label>
          <Form.Control
            type="password"
            className="searchInputBackground"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Form.Group>

        <Button variant="secondary" type="button" onClick={handleRegister}>
          Register
        </Button>
      </Form>
    </Container>
  );
};

export default Register;
