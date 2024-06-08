import React, { useState, useEffect } from "react";
import PokemonCard from "../components/PokemonCard";
import {
  getPokemonList,
  Pokemon,
  getPokedexByUser,
  TrainerPokedexData,
} from "../services/api";
import {
  Container,
  InputGroup,
  FormControl,
  Row,
  Form,
  DropdownButton,
  Dropdown,
  ButtonGroup,
} from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store";
import { setIsLoading } from "../services/auth/authSlice";
import Loader from "../components/Loader";
import "./styles/Pokedex.css";
import { pokemonTypes } from "../utils/pokemonTypes";
import { pokemonTypeTranslations } from "../utils/translations";

const Pokedex: React.FC = () => {
  const dispatch = useDispatch();
  const isLoading = useSelector((state: RootState) => state.auth.isLoading);

  const [originalPokemonList, setOriginalPokemonList] = useState<Pokemon[]>([]);
  const [pokemonList, setPokemonList] = useState<Pokemon[]>([]);
  const [trainerPokedex, setTrainerPokedex] = useState<TrainerPokedexData[]>(
    []
  );
  const [capturedPokemon, setCapturedPokemon] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [showCapturedOnly, setShowCapturedOnly] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch(setIsLoading(true));
        const data = await getPokemonList();
        const trainerPokedex = await getPokedexByUser();
        if (trainerPokedex) setCapturedPokemon(trainerPokedex.length);
        if (data) {
          setOriginalPokemonList(data);
          setPokemonList(data);
        }

        if (trainerPokedex) {
          setTrainerPokedex(trainerPokedex);
        }
      } catch (error) {
        // Manejar error si es necesario
      } finally {
        dispatch(setIsLoading(false));
      }
    };

    fetchData();
  }, [dispatch]);

  useEffect(() => {
    const filteredPokemonList = originalPokemonList.filter(
      (pokemon: Pokemon) => {
        const matchesSearchTerm = pokemon.name
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
        const matchesType =
          selectedTypes.length === 0 ||
          pokemon.pokemonTypes.some((type) =>
            selectedTypes.includes(type.name)
          );
        const matchesCaptured =
          !showCapturedOnly ||
          trainerPokedex.some((p) => p.pokemonId === pokemon.id);
        return matchesSearchTerm && matchesType && matchesCaptured;
      }
    );
    setPokemonList(filteredPokemonList);
  }, [
    searchTerm,
    originalPokemonList,
    selectedTypes,
    showCapturedOnly,
    trainerPokedex,
  ]);

  const handleTypeChange = (type: string) => {
    setSelectedTypes((prevTypes) =>
      prevTypes.includes(type)
        ? prevTypes.filter((t) => t !== type)
        : [...prevTypes, type]
    );
  };

  return (
    <Container className="pokedex-container">
      <div className="header-container">
        <h1>Pokédex</h1>
        <h1>{capturedPokemon}/150</h1>
      </div>

      <InputGroup className="mb-3">
        <FormControl
          type="text"
          className="search-input"
          placeholder="Buscar Pokémon"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </InputGroup>

      <div className="filters-container">
        <DropdownButton
          as={ButtonGroup}
          title="Filtrar por tipo"
          className="mb-3"
        >
          {pokemonTypes.map((type, index) => (
            <Dropdown.Item
              key={index}
              onClick={() => handleTypeChange(type)}
              active={selectedTypes.includes(type)}
              className={selectedTypes.includes(type) ? "custom-active" : ""}
            >
              {pokemonTypeTranslations[type] || type}
            </Dropdown.Item>
          ))}
        </DropdownButton>

        <Form.Check
          type="checkbox"
          id="captured-only"
          label="Mostrar solo capturados"
          checked={showCapturedOnly}
          onChange={() => setShowCapturedOnly(!showCapturedOnly)}
        />
      </div>

      {isLoading ? (
        <Loader />
      ) : (
        <Row>
          {pokemonList.map((pokemon) => {
            const isCaptured = trainerPokedex.some(
              (p) => p.pokemonId === pokemon.id
            );
            return (
              <PokemonCard
                key={pokemon.id}
                pokemon={pokemon}
                isCaptured={isCaptured}
              />
            );
          })}
        </Row>
      )}
    </Container>
  );
};

export default Pokedex;
