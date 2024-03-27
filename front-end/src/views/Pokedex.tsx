import React, { useState, useEffect } from "react";
import PokemonCard from "../components/PokemonCard";
import {
  getPokemonList,
  Pokemon,
  getPokedexByUser,
  TrainerPokedexData,
} from "../services/api";
import { Container, InputGroup, FormControl, Row } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store";
import { setIsLoading } from "../services/auth/authSlice";

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
  }, []);

  useEffect(() => {
    const filteredPokemonList = originalPokemonList.filter((pokemon: Pokemon) =>
      pokemon.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setPokemonList(filteredPokemonList);
  }, [searchTerm, originalPokemonList]);

  return (
    <Container className="mt-3 pb-2 px-5 bg-dark text-light rounded">
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
        className="mb-4 pt-4 px-2"
      >
        <h1>Pokédex</h1>
        <h1>{capturedPokemon}/150</h1>
      </div>

      <InputGroup className="mb-3">
        <FormControl
          type="text"
          className="searchInputBackground"
          placeholder="Buscar Pokémon"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </InputGroup>

      {isLoading ? (
        <p>Cargando...</p>
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
