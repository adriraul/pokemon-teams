import React, { useState } from "react";
import { Carousel, Card, Row, Col, Button, Badge } from "react-bootstrap";
import {
  FaPlay,
  FaTrophy,
  FaBook,
  FaFlask,
  FaShoppingBag,
  FaCircle,
  FaStar,
  FaMedal,
  FaUsers,
  FaChartLine,
} from "react-icons/fa";
import "./styles/HomeStyles.css";

const Home: React.FC = () => {
  const [activeTab, setActiveTab] = useState("overview");

  const gameFeatures = [
    {
      icon: <FaPlay className="feature-icon" />,
      title: "Play & Battle",
      description:
        "Complete 31 challenging levels with strategic Pokémon battles",
      color: "#ff6f61",
      link: "/play",
    },
    {
      icon: <FaTrophy className="feature-icon" />,
      title: "League Challenge",
      description: "Face the Elite Four and become the Champion",
      color: "#ffd700",
      link: "/league",
    },
    {
      icon: <FaBook className="feature-icon" />,
      title: "Pokédex",
      description: "Track your captured Pokémon and complete your collection",
      color: "#4ecdc4",
      link: "/pokedex",
    },
    {
      icon: <FaCircle className="feature-icon" />,
      title: "Pokémon Management",
      description: "Organize your teams and view detailed stats",
      color: "#45b7d1",
      link: "/pokemon",
    },
    {
      icon: <FaFlask className="feature-icon" />,
      title: "Laboratory",
      description: "Combine Pokémon to enhance their abilities",
      color: "#96ceb4",
      link: "/laboratory",
    },
    {
      icon: <FaShoppingBag className="feature-icon" />,
      title: "Pokéballs",
      description: "Acquire new Pokémon and expand your collection",
      color: "#feca57",
      link: "/pokeballs",
    },
  ];

  const stats = [
    { label: "Total Levels", value: "31", icon: <FaStar /> },
    { label: "League Champions", value: "5", icon: <FaMedal /> },
    { label: "Pokémon Available", value: "800+", icon: <FaCircle /> },
    { label: "Active Players", value: "1000+", icon: <FaUsers /> },
  ];

  return (
    <div className="homepage-container">
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-content">
          <div className="hero-logo">
            <img
              src="/images/homepage/banner.png"
              alt="POKETEAMS"
              className="hero-banner"
            />
          </div>
          <h1 className="hero-title">Welcome to POKETEAMS</h1>
          <p className="hero-subtitle">
            Embark on an epic journey to become the ultimate Pokémon Champion!
          </p>
          <div className="hero-stats">
            {stats.map((stat, index) => (
              <div key={index} className="stat-item">
                <div className="stat-icon">{stat.icon}</div>
                <div className="stat-content">
                  <div className="stat-value">{stat.value}</div>
                  <div className="stat-label">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Game Features Section */}
      <div className="features-section">
        <h2 className="section-title">Game Features</h2>
        <Row className="features-grid">
          {gameFeatures.map((feature, index) => (
            <Col key={index} lg={4} md={6} className="mb-4">
              <Card
                className="feature-card"
                style={{ borderColor: feature.color }}
              >
                <Card.Body className="text-center">
                  <div
                    className="feature-icon-wrapper"
                    style={{ color: feature.color }}
                  >
                    {feature.icon}
                  </div>
                  <Card.Title className="feature-title">
                    {feature.title}
                  </Card.Title>
                  <Card.Text className="feature-description">
                    {feature.description}
                  </Card.Text>
                  <Button
                    variant="outline-primary"
                    className="feature-button"
                    style={{ borderColor: feature.color, color: feature.color }}
                    href={feature.link}
                  >
                    Explore
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </div>

      {/* Tutorial Section */}
      <div className="tutorial-section">
        <div className="tutorial-header">
          <h2 className="section-title">How to Play</h2>
          <div className="tab-buttons">
            <Button
              variant={activeTab === "overview" ? "primary" : "outline-primary"}
              onClick={() => setActiveTab("overview")}
              className="tab-button"
            >
              Overview
            </Button>
            <Button
              variant={activeTab === "tutorial" ? "primary" : "outline-primary"}
              onClick={() => setActiveTab("tutorial")}
              className="tab-button"
            >
              Step-by-Step
            </Button>
          </div>
        </div>

        {activeTab === "overview" && (
          <div className="overview-content">
            <Row>
              <Col md={6}>
                <div className="overview-step">
                  <div className="step-number">1</div>
                  <div className="step-content">
                    <h4>Get Pokémon</h4>
                    <p>Use Pokéballs to acquire Pokémon for your team</p>
                  </div>
                </div>
                <div className="overview-step">
                  <div className="step-number">2</div>
                  <div className="step-content">
                    <h4>Build Your Team</h4>
                    <p>
                      Organize your Pokémon and create powerful combinations
                    </p>
                  </div>
                </div>
              </Col>
              <Col md={6}>
                <div className="overview-step">
                  <div className="step-number">3</div>
                  <div className="step-content">
                    <h4>Complete Levels</h4>
                    <p>Battle through 31 challenging levels to earn badges</p>
                  </div>
                </div>
                <div className="overview-step">
                  <div className="step-number">4</div>
                  <div className="step-content">
                    <h4>Become Champion</h4>
                    <p>Face the League and claim the ultimate title</p>
                  </div>
                </div>
              </Col>
            </Row>
          </div>
        )}

        {activeTab === "tutorial" && (
          <div className="carousel-wrapper">
            <Carousel className="homepage-carousel" interval={6000}>
              <Carousel.Item>
                <img
                  src="/images/homepage/pokeballs1.png"
                  alt="Step 1: Pokeballs"
                  className="carousel-image"
                />
                <div className="carousel-caption-wrapper">
                  <h3>Step 1: Pokeballs</h3>
                  <p>Use your balance to acquire Pokémon for battle</p>
                  <Badge bg="info">Check probabilities before buying</Badge>
                </div>
              </Carousel.Item>

              <Carousel.Item>
                <img
                  src="/images/homepage/box1.png"
                  alt="Step 2: Pokémon Management"
                  className="carousel-image"
                />
                <div className="carousel-caption-wrapper">
                  <h3>Step 2: Build Your Team</h3>
                  <p>View your boxes and create the perfect team</p>
                  <Badge bg="success">Check IVs and moves</Badge>
                </div>
              </Carousel.Item>

              <Carousel.Item>
                <img
                  src="/images/homepage/combat1.png"
                  alt="Step 3: Battle"
                  className="carousel-image"
                />
                <div className="carousel-caption-wrapper">
                  <h3>Step 3: Strategic Battles</h3>
                  <p>Select your starter and use strategy to win</p>
                  <Badge bg="warning">Attack, switch, or surrender</Badge>
                </div>
              </Carousel.Item>

              <Carousel.Item>
                <img
                  src="/images/homepage/league.png"
                  alt="Step 4: League"
                  className="carousel-image"
                />
                <div className="carousel-caption-wrapper">
                  <h3>Step 4: League Challenge</h3>
                  <p>Face the Elite Four and become Champion</p>
                  <Badge bg="danger">High IV Pokémon with AI</Badge>
                </div>
              </Carousel.Item>

              <Carousel.Item>
                <img
                  src="/images/homepage/laboratory.png"
                  alt="Bonus: Laboratory"
                  className="carousel-image"
                />
                <div className="carousel-caption-wrapper">
                  <h3>Bonus: Laboratory</h3>
                  <p>Combine Pokémon to enhance their abilities</p>
                  <Badge bg="secondary">Strategic combinations</Badge>
                </div>
              </Carousel.Item>
            </Carousel>
          </div>
        )}
      </div>

      {/* Call to Action */}
      <div className="cta-section">
        <h2>Ready to Start Your Journey?</h2>
        <p>Join thousands of trainers in the ultimate Pokémon adventure!</p>
        <Button variant="success" size="lg" href="/play" className="cta-button">
          <FaPlay className="me-2" />
          Start Playing Now
        </Button>
      </div>
    </div>
  );
};

export default Home;
