import React, { useState } from "react";
import { Image, Modal, Button } from "react-bootstrap";
import "../components/styles/PokeballsStyles.css";

interface PokeballProps {
  price: string;
}

const PriceLabel: React.FC<PokeballProps> = ({ price }) => {
  const [modalOpen, setModalOpen] = useState(false);

  const handleModalOpen = () => {
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
  };

  return (
    <div className="pokeball__price-label--box">
      <div className="pokeball__price-label--image">
        <Image
          src={"/images/elements/buttons/brown-wooden-sign-board.png"}
          alt={`PriceLabel ${price}`}
        />
      </div>
      <div className="pokeball__price-label--price">
        <p>{price}</p>
      </div>
    </div>
  );
};

export default PriceLabel;
