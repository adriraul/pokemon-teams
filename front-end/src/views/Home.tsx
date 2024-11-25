import React from "react";
import { Carousel } from "react-bootstrap";
import "./styles/HomeStyles.css";

const Home: React.FC = () => {
  return (
    <div className="homepage-container">
      <div className="banner-wrapper">
        <img
          src={`/images/homepage/banner.png`}
          alt="ÑEMON Banner"
          className="homepage-banner"
        />
      </div>

      <div className="carousel-wrapper">
        <Carousel className="homepage-carousel" interval={5000}>
          <Carousel.Item>
            <img
              src={`/images/homepage/combat.png`}
              alt="Paso 1"
              className="carousel-image"
            />
            <div className="carousel-caption-wrapper">
              <h3>How to Play</h3>
              <p>
                The goal of the game is to collect all 8 badges. Can you achieve
                it?
              </p>
            </div>
          </Carousel.Item>

          <Carousel.Item>
            <img
              src={`/images/homepage/pokeballs1.png`}
              alt="Paso 1"
              className="carousel-image"
            />
            <div className="carousel-caption-wrapper">
              <h3>Step 1: Pokeballs</h3>
              <p>
                Here you can use your balance to acquire Pokémon to battle with.
              </p>
            </div>
          </Carousel.Item>

          <Carousel.Item>
            <img
              src={`/images/homepage/pokeballs2.png`}
              alt="Paso 2"
              className="carousel-image"
            />
            <div className="carousel-caption-wrapper">
              <p>
                When you select the pokeball you want, you can check the
                probabilities of obtaining each available Pokémon through the
                information button.
              </p>
            </div>
          </Carousel.Item>

          <Carousel.Item>
            <img
              src={`/images/homepage/pokeballs3.png`}
              alt="Paso 3"
              className="carousel-image"
            />
            <div className="carousel-caption-wrapper">
              <p>
                Once you have your Pokémon, you can assign it a nickname, and it
                will be ready to battle.
              </p>
            </div>
          </Carousel.Item>

          <Carousel.Item>
            <img
              src={`/images/homepage/box1.png`}
              alt="Paso 2"
              className="carousel-image"
            />
            <div className="carousel-caption-wrapper">
              <h3>Step 2: Pokémon</h3>
              <p>
                Here you can view your boxes, containing the Pokémon you
                acquired from pokeballs.
              </p>
              <p>
                This is where you can create the team you'll use for battles.
              </p>
            </div>
          </Carousel.Item>

          <Carousel.Item>
            <img
              src={`/images/homepage/box2.png`}
              alt="Paso 2"
              className="carousel-image"
            />
            <div className="carousel-caption-wrapper">
              <p>
                By clicking on a Pokémon, you can check its IVs and remaining
                moves.
              </p>
              <p>
                You also have the option to release the Pokémon in exchange for
                some PokeDollars based on its remaining moves.
              </p>
            </div>
          </Carousel.Item>

          <Carousel.Item>
            <img
              src={`/images/homepage/combat1.png`}
              alt="Paso 3"
              className="carousel-image"
            />
            <div className="carousel-caption-wrapper">
              <h3>Step 3: Levels</h3>
              <p>
                When starting a level, you will need to select your starter
                Pokémon.
              </p>
            </div>
          </Carousel.Item>

          <Carousel.Item>
            <img
              src={`/images/homepage/combat2.png`}
              alt="Paso 3"
              className="carousel-image"
            />
            <div className="carousel-caption-wrapper">
              <p>
                During the battle, you will have the options to attack using any
                of your Pokémon's available moves, switch Pokémon, or surrender.
              </p>
            </div>
          </Carousel.Item>

          <Carousel.Item>
            <img
              src={`/images/homepage/combat3.png`}
              alt="Paso 3"
              className="carousel-image"
            />
            <div className="carousel-caption-wrapper">
              <p>
                Upon completing a level, you will be able to claim the rewards
                offered by that level.
              </p>
              <p>You can earn PokeDollars, accessories, or badges.</p>
            </div>
          </Carousel.Item>

          <Carousel.Item>
            <img
              src={`/images/homepage/league.png`}
              alt="Paso 4"
              className="carousel-image"
            />
            <div className="carousel-caption-wrapper">
              <h3>Step 3: League</h3>
              <p>Once all levels are completed, you can face the League.</p>
              <p>
                Battles will be challenging, featuring Pokémon with high IVs and
                AI designed to win.
              </p>
            </div>
          </Carousel.Item>

          <Carousel.Item>
            <img
              src={`/images/homepage/league2.png`}
              alt="Paso 4"
              className="carousel-image"
            />
            <div className="carousel-caption-wrapper">
              <p>
                First, you will need to choose a team of 3 Pokémon. It doesn't
                matter if they don't have any moves.
              </p>
              <p>
                The team cannot be changed until the League is completed or
                lost.
              </p>
              <p>Pokémon will automatically heal after winning each battle.</p>
            </div>
          </Carousel.Item>

          <Carousel.Item>
            <img
              src={`/images/homepage/league3.png`}
              alt="Paso 4"
              className="carousel-image"
            />
            <div className="carousel-caption-wrapper">
              <p>Defeating the Elite Four will unlock the Champion.</p>
              <p>
                Upon defeating the Champion, you will receive a badge and
                $50,000.
              </p>
            </div>
          </Carousel.Item>

          <Carousel.Item>
            <img
              src={`/images/homepage/pokedex1.png`}
              alt="Paso 2"
              className="carousel-image"
            />
            <div className="carousel-caption-wrapper">
              <h3>Pokedex</h3>
              <p>Here you can view and filter the Pokémon you have captured.</p>
              <p>¡Catch 'Em All!</p>
            </div>
          </Carousel.Item>

          <Carousel.Item>
            <img
              src={`/images/homepage/laboratory.png`}
              alt="Paso 2"
              className="carousel-image"
            />
            <div className="carousel-caption-wrapper">
              <h3>Laboratory</h3>
              <p>Here you can make use of the Pokémon you no longer need!</p>
              <p>
                You'll have the option to combine compatible Pokémon to enhance
                their stats and moves.
              </p>
            </div>
          </Carousel.Item>

          <Carousel.Item>
            <img
              src={`/images/homepage/profile.png`}
              alt="Paso 2"
              className="carousel-image"
            />
            <div className="carousel-caption-wrapper">
              <h3>Profile</h3>
              <p>
                Here you can view your badges, general statistics, and customize
                your avatar.
              </p>
            </div>
          </Carousel.Item>
        </Carousel>
      </div>
    </div>
  );
};

export default Home;
