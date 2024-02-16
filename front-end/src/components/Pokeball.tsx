import React, { useState } from "react";
import { Image, Modal, Button } from "react-bootstrap";
import { openPokeball } from "../services/api";
import { useAppDispatch } from "../hooks/redux/hooks";
import { updateBalance } from "../services/auth/authSlice";

interface PokeballProps {
  imageUrl: string;
  altura: string;
  pokeballType: string;
  userBalance: string | null;
  price: number;
}

const Pokeball: React.FC<PokeballProps> = ({
  imageUrl,
  altura,
  pokeballType,
  userBalance,
  price,
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const dispatch = useAppDispatch();

  const handleModalOpen = () => {
    if (userBalance && parseInt(userBalance) - price > 0) {
      setModalOpen(true);
    }
  };

  const handleModalClose = () => {
    setModalOpen(false);
  };

  const handleOpenPokeball = async () => {
    let pokeballTypeToBack = "";
    if (pokeballType === "Pokeball") {
      pokeballTypeToBack = "Pokeball";
    } else if (pokeballType === "Superball") {
      pokeballTypeToBack = "Greatball";
    } else if (pokeballType === "Ultraball") {
      pokeballTypeToBack = "Ultraball";
    }

    const response = await openPokeball(pokeballTypeToBack);
    dispatch(updateBalance(response.newBalance));
    setModalOpen(false);
  };

  return (
    <div>
      {/* Pokeball Image (Clickable) */}
      <Image
        src={imageUrl}
        alt={`Pokeball ${pokeballType}`}
        style={{ height: altura, cursor: "pointer" }}
        onClick={handleModalOpen}
      />

      {/* Modal */}
      <Modal show={modalOpen} onHide={handleModalClose}>
        <Modal.Header closeButton>
          <Modal.Title className="pokeball__open-title">{`¿Quieres abrir una ${pokeballType}?`}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="pokeball__open-body">
          {/* Aquí puedes agregar más detalles sobre la Pokeball si es necesario */}
          <Image
            src={imageUrl}
            alt={`Pokeball ${pokeballType}`}
            style={{ height: altura }}
          />
        </Modal.Body>

        {userBalance ? (
          <Modal.Body className="pokeball__open-body">
            {" "}
            {`Balance restante después de la compra: ${
              parseInt(userBalance) - price
            }$`}
          </Modal.Body>
        ) : (
          <></>
        )}

        <Modal.Footer className="pokeball__open-footer">
          <Button variant="secondary" onClick={handleModalClose}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleOpenPokeball}>
            Abrir
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Pokeball;
