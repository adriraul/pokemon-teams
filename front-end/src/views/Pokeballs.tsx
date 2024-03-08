import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import Pokeball from "../components/Pokeball";
import PriceLabel from "../components/PriceLabel";
import { RootState } from "../store";
import { useAppSelector } from "../hooks/redux/hooks";
import "../components/styles/PokeballsStyles.css";

const Pokeballs: React.FC = () => {
  const balance = useAppSelector((state: RootState) => state.auth.balance);
  return (
    <Container>
      <Row className="row__pokeballs">
        {/* Primera Pokeball */}
        <Col>
          <Pokeball
            imageUrl="/images/elements/buttons/poke_ball.png"
            altura="altura_deseada"
            pokeballType="Pokeball"
            userBalance={balance}
            price={100}
          />
          <PriceLabel price="100$" />
        </Col>

        {/* Segunda Pokeball */}
        <Col>
          <Pokeball
            imageUrl="/images/elements/buttons/super_ball.png"
            altura="altura_deseada"
            pokeballType="Greatball"
            userBalance={balance}
            price={200}
          />
          <PriceLabel price="200$" />
        </Col>

        {/* Tercera Pokeball */}
        <Col>
          <Pokeball
            imageUrl="/images/elements/buttons/ultra_ball.png"
            altura="altura_deseada"
            pokeballType="Ultraball"
            userBalance={balance}
            price={300}
          />
          <PriceLabel price="300$" />
        </Col>
      </Row>
    </Container>
  );
};

export default Pokeballs;
