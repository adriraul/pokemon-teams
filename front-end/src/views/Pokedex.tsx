import React, { useState, useEffect } from "react";
import PokemonCard from "../components/PokemonCard";
import { getPokemonList, Pokemon } from "../services/api";
import { Container, InputGroup, FormControl, Row } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store";
import { setIsLoading } from "../services/auth/authSlice";

const Pokedex: React.FC = () => {
  const dispatch = useDispatch();
  const isLoading = useSelector((state: RootState) => state.auth.isLoading);

  const [originalPokemonList, setOriginalPokemonList] = useState<Pokemon[]>([]);
  const [pokemonList, setPokemonList] = useState<Pokemon[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch(setIsLoading(true));
        const data = await getPokemonList();
        if (data) {
          setOriginalPokemonList(data);
          setPokemonList(data);
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
      <h1 className="mb-4 pt-4 px-2">Pokédex</h1>

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
          {pokemonList.map((pokemon) => (
            <PokemonCard key={pokemon.id} pokemon={pokemon} />
          ))}
        </Row>
      )}
    </Container>
  );
};

export default Pokedex;
