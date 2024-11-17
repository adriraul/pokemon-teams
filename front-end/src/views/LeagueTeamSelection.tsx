import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getPokemonLaboratory,
  createLeagueTeam,
  TrainerPokemon,
} from "../services/api";
import { Button, Card, Container, Dropdown } from "react-bootstrap";
import "./styles/LeagueTeamSelection.css";

const LeagueTeamSelection: React.FC = () => {
  const [trainerPokemons, setTrainerPokemons] = useState<TrainerPokemon[]>([]);
  const [selectedPokemons, setSelectedPokemons] = useState<number[]>([]);
  const [sortCriteria, setSortCriteria] = useState<string>("pokedex");
  const [isAscending, setIsAscending] = useState<boolean>(true);
  const navigate = useNavigate();

  React.useEffect(() => {
    const fetchPokemons = async () => {
      const pokemons = await getPokemonLaboratory();
      setTrainerPokemons(pokemons);
    };

    fetchPokemons();
  }, []);

  const handlePokemonSelect = (id: number) => {
    if (selectedPokemons.includes(id)) {
      setSelectedPokemons(selectedPokemons.filter((pid) => pid !== id));
    } else if (selectedPokemons.length < 3) {
      setSelectedPokemons([...selectedPokemons, id]);
    }
  };

  const handleSaveTeam = async () => {
    if (selectedPokemons.length !== 3) {
      alert("You must select exactly 3 Pokémon.");
      return;
    }
    try {
      await createLeagueTeam(selectedPokemons);
      navigate("/league");
    } catch (error) {
      console.error(error);
    }
  };

  const handleSortChange = (criteria: string | null) => {
    if (criteria) {
      setSortCriteria(criteria);
    }
  };

  const toggleSortOrder = () => {
    setIsAscending(!isAscending);
  };

  const sortedPokemons = [...trainerPokemons].sort((a, b) => {
    let compareValue = 0;

    switch (sortCriteria) {
      case "pokedex":
        compareValue =
          parseInt(a.pokemon.pokedex_id) - parseInt(b.pokemon.pokedex_id);
        break;
      case "ivs":
        const sumA = a.ivPS + a.ivAttack + a.ivDefense;
        const sumB = b.ivPS + b.ivAttack + b.ivDefense;
        compareValue = sumA - sumB;
        break;
      case "power":
        compareValue = a.pokemon.power - b.pokemon.power;
        break;
      default:
        break;
    }

    return isAscending ? compareValue : -compareValue;
  });

  return (
    <Container className="league-team-selection">
      <h1 className="text-center">Select Your League Team</h1>
      <p className="text-center">
        Select exactly 3 Pokémon in the order you want to use them.
      </p>

      <div className="d-flex justify-content-between mb-3">
        <Dropdown onSelect={handleSortChange}>
          <Dropdown.Toggle variant="secondary" id="dropdown-sort">
            Sort By:{" "}
            {sortCriteria.charAt(0).toUpperCase() + sortCriteria.slice(1)}
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Item eventKey="pokedex">Pokedex ID</Dropdown.Item>
            <Dropdown.Item eventKey="ivs">Sum of IVs</Dropdown.Item>
            <Dropdown.Item eventKey="power">Power</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>

        <Button variant="secondary" onClick={toggleSortOrder}>
          {isAscending ? "Ascending" : "Descending"}
        </Button>
      </div>

      <div className="pokemon-list-container">
        <div className="pokemon-grid">
          {sortedPokemons.map((pokemon) => {
            const selectedIndex = selectedPokemons.indexOf(pokemon.id);

            return (
              <Card
                key={pokemon.id}
                className={`pokemon-card ${
                  selectedPokemons.includes(pokemon.id) ? "selected" : ""
                }`}
                onClick={() => handlePokemonSelect(pokemon.id)}
              >
                {selectedIndex !== -1 && (
                  <div className="selection-number">{selectedIndex + 1}</div>
                )}
                <Card.Img
                  variant="top"
                  src={`/images/pokedex/${String(
                    pokemon.pokemon.pokedex_id
                  ).padStart(3, "0")}.png`}
                  alt={pokemon.nickname}
                />
                <Card.Body>
                  <Card.Title className="pokemon-title">
                    <b>{pokemon.nickname}</b>
                  </Card.Title>
                  <Card.Text className="pokemon-stats">
                    Power: {pokemon.pokemon.power}
                    <br></br>
                    IVs: {pokemon.ivPS}/{pokemon.ivAttack}/{pokemon.ivDefense}
                  </Card.Text>
                </Card.Body>
              </Card>
            );
          })}
        </div>
      </div>

      <div className="d-flex justify-content-end mt-3">
        <Button
          variant="primary"
          onClick={handleSaveTeam}
          disabled={selectedPokemons.length !== 3}
        >
          Save Team
        </Button>
      </div>
    </Container>
  );
};

export default LeagueTeamSelection;
