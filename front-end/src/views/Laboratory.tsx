import React, { useState, useEffect } from "react";
import { Button, Modal, Dropdown } from "react-bootstrap";
import {
  getPokemonLaboratory,
  TrainerPokemon,
  getMergeResults,
  mergePokemon,
} from "../services/api";
import { Radar } from "react-chartjs-2";
import { Chart, RadialLinearScale, PointElement, LineElement } from "chart.js";
import "./styles/LaboratoryStyles.css";
import MovementsTable from "../components/MovementsTable";

Chart.register(RadialLinearScale, PointElement, LineElement);

const Laboratory: React.FC = () => {
  const [firstPokemon, setFirstPokemon] = useState<TrainerPokemon | null>(null);
  const [secondPokemon, setSecondPokemon] = useState<TrainerPokemon | null>(
    null
  );
  const [showModal, setShowModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [selectingSecond, setSelectingSecond] = useState(false);
  const [pokemonList, setPokemonList] = useState<TrainerPokemon[]>([]);
  const [selectedPokemonDetails, setSelectedPokemonDetails] =
    useState<TrainerPokemon | null>(null);
  const [sortCriteria, setSortCriteria] = useState<string>("pokedex");
  const [isAscending, setIsAscending] = useState(true);
  const [mergeResults, setMergeResults] = useState<string[]>([]);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [updatedPokemon, setUpdatedPokemon] = useState<TrainerPokemon | null>(
    null
  );
  const [showUpdatedData, setShowUpdatedData] = useState(false);

  const handleSelectPokemon = (pokemon: TrainerPokemon) => {
    setSelectedPokemonDetails(pokemon);
    setShowDetailsModal(true);
  };

  const confirmPokemonSelection = () => {
    if (selectingSecond) {
      setSecondPokemon(selectedPokemonDetails);
      fetchMergeResults(selectedPokemonDetails);
    } else {
      setFirstPokemon(selectedPokemonDetails);
      setSecondPokemon(null);
    }
    setShowDetailsModal(false);
    setShowModal(false);
  };

  const fetchMergeResults = async (selectedPokemon: TrainerPokemon | null) => {
    if (firstPokemon && selectedPokemon) {
      try {
        const results = await getMergeResults(
          firstPokemon.id,
          selectedPokemon.id
        );
        setMergeResults(results);
      } catch (error) {
        console.error("Error fetching merge results:", error);
      }
    }
  };

  const handleMergeConfirmation = () => {
    setShowConfirmationModal(true);
  };

  const handleCloseResultsModal = async () => {
    setShowResultsModal(false);
    setFirstPokemon(null);
    setSecondPokemon(null);
    setShowUpdatedData(false);
    setUpdatedPokemon(null);
    setMergeResults([]);
    try {
      const response = await getPokemonLaboratory();
      setPokemonList(response);
    } catch (error) {
      console.error("Error fetching Pokémon:", error);
    }
  };

  const handleMerge = async () => {
    if (firstPokemon && secondPokemon) {
      try {
        const updatedPokemonData = await mergePokemon(
          firstPokemon.id,
          secondPokemon.id
        );

        setShowConfirmationModal(false);
        setUpdatedPokemon(updatedPokemonData);
        setShowResultsModal(true);
        setShowUpdatedData(false);

        setTimeout(() => {
          setShowUpdatedData(true);
        }, 2000);
      } catch (error) {
        console.error("Error during the merge:", error);
      }
    }
  };

  const openModal = (isSelectingSecond: boolean) => {
    setSelectingSecond(isSelectingSecond);
    setShowModal(true);
  };

  const toggleSortOrder = () => {
    setIsAscending(!isAscending);
  };

  const sortPokemonList = () => {
    let sortedList = [...pokemonList];

    switch (sortCriteria) {
      case "pokedex":
        sortedList.sort(
          (a, b) =>
            parseInt(a.pokemon.pokedex_id) - parseInt(b.pokemon.pokedex_id)
        );
        break;
      case "ivs":
        sortedList.sort((a, b) => {
          const sumA = a.ivPS + a.ivAttack + a.ivDefense;
          const sumB = b.ivPS + b.ivAttack + b.ivDefense;
          return sumA - sumB;
        });
        break;
      case "movements":
        sortedList.sort((a, b) => {
          const sumA = a.movements.reduce(
            (sum, move) => sum + move.quantity,
            0
          );
          const sumB = b.movements.reduce(
            (sum, move) => sum + move.quantity,
            0
          );
          return sumA - sumB;
        });
        break;
      default:
        break;
    }

    if (!isAscending) {
      sortedList.reverse();
    }

    setPokemonList(sortedList);
  };

  useEffect(() => {
    sortPokemonList();
  }, [sortCriteria, isAscending]);

  useEffect(() => {
    const fetchPokemon = async () => {
      try {
        const response = await getPokemonLaboratory();
        setPokemonList(response);
      } catch (error) {
        console.error("Error fetching Pokémon:", error);
      }
    };

    fetchPokemon();
  }, []);

  const filteredPokemonList = selectingSecond
    ? pokemonList.filter((pokemon) => {
        if (!firstPokemon) return true;

        if (firstPokemon.id === pokemon.id) return false;

        const firstPokemonTypes = firstPokemon.pokemon.pokemonTypes.map(
          (type) => type.name
        );
        const pokemonTypes = pokemon.pokemon.pokemonTypes.map(
          (type) => type.name
        );
        return pokemonTypes.some((type) => firstPokemonTypes.includes(type));
      })
    : pokemonList;

  const removeFirstPokemon = () => {
    setFirstPokemon(null);
    setMergeResults([]);
  };

  const removeSecondPokemon = () => {
    setSecondPokemon(null);
    setMergeResults([]);
  };

  const renderRadarChart = (pokemon: TrainerPokemon | null) => {
    if (!pokemon) return null;

    const data = {
      labels: ["PS", "Atk", "Def"],
      datasets: [
        {
          label: "IVs del Pokémon",
          data: [
            pokemon.ivPS || 0,
            pokemon.ivAttack || 0,
            pokemon.ivDefense || 0,
          ],
          backgroundColor: "rgba(54, 162, 235, 0.2)",
          borderColor: "white",
          borderWidth: 1,
          pointBackgroundColor: "white",
          pointBorderColor: "#fff",
          pointHoverRadius: 5,
          pointRadius: 3,
        },
      ],
    };

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        r: {
          angleLines: { display: true },
          beginAtZero: true,
          min: 0,
          max: 31,
          ticks: { display: false },
          grid: { color: "rgba(255, 255, 255, 0.1)" },
          pointLabels: {
            color: "white",
            font: { size: 14 },
          },
        },
      },
    };

    return (
      <div style={{ width: "250px", height: "250px" }}>
        <Radar data={data} options={options} />
      </div>
    );
  };

  return (
    <div className="laboratory-container">
      <div className="laboratory-capsule-container">
        <div className="laboratory-capsule">
          {firstPokemon ? (
            <>
              <img
                src={`/images/pokedex/${String(
                  firstPokemon.pokemon.pokedex_id
                ).padStart(3, "0")}.avif`}
                alt="First Pokemon"
                className="laboratory-pokemon-image"
              />
              <p>{firstPokemon ? `${firstPokemon.nickname}` : ""}</p>
              <Button
                className="laboratory-remove-button"
                onClick={removeFirstPokemon}
              >
                Remove
              </Button>
            </>
          ) : (
            <Button
              className="laboratory-select-button"
              onClick={() => openModal(false)}
            >
              +
            </Button>
          )}
        </div>
      </div>

      <div className="laboratory-capsule-container">
        <div>
          <Button
            className="laboratory-merge-button"
            disabled={!firstPokemon || !secondPokemon}
            onClick={handleMergeConfirmation}
          >
            MERGE
          </Button>
        </div>

        {mergeResults.length > 0 && (
          <div className="laboratory-merge-results">
            <ul className="merge-results">
              {mergeResults.map((result, index) => (
                <li key={index}>{result}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="laboratory-capsule-container">
        <div className="laboratory-capsule">
          {secondPokemon ? (
            <>
              <img
                src={`/images/pokedex/${String(
                  secondPokemon.pokemon.pokedex_id
                ).padStart(3, "0")}.avif`}
                alt="Second Pokemon"
                className="laboratory-pokemon-image"
              />
              <p>{secondPokemon ? `${secondPokemon.nickname}` : ""}</p>
              <Button
                className="laboratory-remove-button"
                onClick={removeSecondPokemon}
              >
                Remove
              </Button>
            </>
          ) : (
            <Button
              className="laboratory-select-button"
              onClick={() => openModal(true)}
            >
              +
            </Button>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      <Modal
        show={showConfirmationModal}
        onHide={() => setShowConfirmationModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            Are you sure you want to merge these Pokémon?
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          This action will merge {firstPokemon?.nickname} and{" "}
          {secondPokemon?.nickname}.
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowConfirmationModal(false)}
          >
            Cancel
          </Button>
          <Button variant="danger" onClick={handleMerge}>
            Confirm
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Results Modal */}
      <Modal
        show={showResultsModal}
        onHide={() => setShowResultsModal(false)}
        centered
        size="lg"
        dialogClassName="laboratory-fullscreen-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>{updatedPokemon?.nickname}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="laboratory-pokemon-details-body">
          {updatedPokemon && (
            <>
              <img
                src={`/images/pokedex/${String(
                  updatedPokemon.pokemon.pokedex_id
                ).padStart(3, "0")}.avif`}
                alt={updatedPokemon.pokemon.name}
                className="laboratory-pokemon-image"
              />
              {showUpdatedData
                ? renderRadarChart(updatedPokemon)
                : renderRadarChart(firstPokemon)}
              {showUpdatedData ? (
                <MovementsTable trainerPokemon={updatedPokemon} />
              ) : (
                <MovementsTable trainerPokemon={firstPokemon} />
              )}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={() => handleCloseResultsModal()}>OK</Button>
        </Modal.Footer>
      </Modal>

      {/* Modal de selección de Pokémon */}
      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        size="lg"
        dialogClassName="laboratory-fullscreen-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>Select Pokémon</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="laboratory-sort-buttons">
            <Dropdown onSelect={(e) => setSortCriteria(e || "pokedex")}>
              <Dropdown.Toggle variant="secondary">Sort By</Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item eventKey="pokedex">Pokedex Number</Dropdown.Item>
                <Dropdown.Item eventKey="ivs">Sum of IVs</Dropdown.Item>
                <Dropdown.Item eventKey="movements">
                  Sum of Movements
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
            <Button variant="secondary" onClick={toggleSortOrder}>
              {isAscending ? "Ascending" : "Descending"}
            </Button>
          </div>
          <div className="laboratory-pokemon-list">
            {filteredPokemonList.map((pokemon) => (
              <button
                key={pokemon.id}
                className="laboratory-pokemon-select-button"
                onClick={() => handleSelectPokemon(pokemon)}
              >
                <img
                  src={`/images/pokedex/${String(
                    pokemon.pokemon.pokedex_id
                  ).padStart(3, "0")}.avif`}
                  alt={pokemon.nickname}
                  className="laboratory-pokemon-list-img"
                />
                <p className="laboratory-pokemon-list-name">
                  {pokemon.nickname}
                </p>
              </button>
            ))}
          </div>
        </Modal.Body>
      </Modal>

      {/* Modal de detalles del Pokémon */}
      <Modal
        show={showDetailsModal}
        onHide={() => setShowDetailsModal(false)}
        size="lg"
        dialogClassName="laboratory-fullscreen-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>{selectedPokemonDetails?.nickname}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="laboratory-pokemon-details-body">
          {
            <>
              {renderRadarChart(selectedPokemonDetails)}
              {<MovementsTable trainerPokemon={selectedPokemonDetails} />}
              <Button
                className="laboratory-confirm-button"
                onClick={confirmPokemonSelection}
              >
                Confirm
              </Button>
              <Button
                className="laboratory-cancel-button"
                onClick={() => setShowDetailsModal(false)}
              >
                Cancel
              </Button>
            </>
          }
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Laboratory;
