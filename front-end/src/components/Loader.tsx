import React from "react";
import { Spinner } from "react-bootstrap";

const Loader: React.FC = () => {
  return (
    <div
      style={{
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        zIndex: 9999,
      }}
    >
      <Spinner animation="border" role="status"></Spinner>
    </div>
  );
};

export default Loader;
