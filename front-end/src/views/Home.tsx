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
              <h3>Pasos para jugar</h3>
              <p>
                El objetivo del juego es hacerte con las 8 medallas, ¿podrás
                conseguirlo?
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
              <h3>Paso 1: Pokeballs</h3>
              <p>
                Auqí podrás adquirir con tu balance tus pokemon para poder
                combatir.
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
                Cuando selecciones la pokeball que desees, podrás consultar a
                través del botón de información qué probabilidades tienes de
                conseguir cada uno de los pokemon disponibles.
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
                Una vez tienes tu pokemon, podrás asignarle un mote y lo tendrás
                listo para combatir.
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
              <h3>Paso 2: Pokemon</h3>
              <p>
                Aquí podrás visualizar tus cajas, con tus pokemon adquiridos en
                pokeballs.
              </p>
              <p>Aquí podrás crearte el equipo que usarás para combatir.</p>
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
                Si haces clic en un pokemon, podrás consultar sus IVs y sus
                movimientos restantes.
              </p>
              <p>
                También tienes la opción de liberar al pokemon a cambio de unos
                PokeDollars según sus movimientos restantes.
              </p>
            </div>
          </Carousel.Item>

          <Carousel.Item>
            <img
              src={`/images/homepage/combat1.png`}
              alt="Paso 2"
              className="carousel-image"
            />
            <div className="carousel-caption-wrapper">
              <h3>Paso 3: Combate</h3>
              <p>
                Al iniciar un nivel, tendrás que seleccionar tu pokemon inicial.
              </p>
            </div>
          </Carousel.Item>

          <Carousel.Item>
            <img
              src={`/images/homepage/combat2.png`}
              alt="Paso 2"
              className="carousel-image"
            />
            <div className="carousel-caption-wrapper">
              <p>
                En el combate tendrás las opciones de atacar con cualquiera de
                los ataques disponibles de tu pokemon, cambiar de pokemon o
                rendirte.
              </p>
            </div>
          </Carousel.Item>

          <Carousel.Item>
            <img
              src={`/images/homepage/combat3.png`}
              alt="Paso 2"
              className="carousel-image"
            />
            <div className="carousel-caption-wrapper">
              <p>
                Al completar un nivel podrás reclamar las recompensas que te
                ofrezca el nivel.
              </p>
              <p>Puedes obtener PokeDollars, accesorios o medallas. </p>
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
              <p>
                Aquí podrás consultar y filtrar los pokemon que has capturado.
                Tienes disponibles hasta la cuarta generación.
              </p>
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
              <p>¡Aquí podrás darle uso a los pokemon que no necesites!</p>
              <p>
                Tendrás la posibilidad de mezclar pokemon compatibles para
                aumentar sus estadísticas y movimientos.
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
                Aquí podrás consultar tus medallas, tus estadísticas generales,
                y personalizar tu avatar.
              </p>
            </div>
          </Carousel.Item>
        </Carousel>
      </div>
    </div>
  );
};

export default Home;
