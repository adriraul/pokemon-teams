import React from 'react';
import { Routes, Route, Outlet, Link } from "react-router-dom";
//import Header from './components/Header';
import Home from './views/Home';
import Pokedex from './views/Pokedex';


function App() {
  //      <Route path="*" element={<NoMatch />} />
  //
  return (
  <Routes>
    <Route path="/" element={<Layout />}>
      <Route index element={<Home />} />
      <Route path="/pokedex" element={<Pokedex />} />

    </Route>
  </Routes>
  );
}

function Layout() {
  return (
    <div>
      {/* A "layout route" is a good place to put markup you want to
          share across all the pages on your site, like navigation. */}
      <nav>
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/pokedex">About</Link>
          </li>
          <li>
            <Link to="/dashboard">Dashboard</Link>
          </li>
          <li>
            <Link to="/nothing-here">Nothing Here</Link>
          </li>
        </ul>
      </nav>

      <hr />

      {/* An <Outlet> renders whatever child route is currently active,
          so you can think about this <Outlet> as a placeholder for
          the child routes we defined above. */}
      <Outlet />
    </div>
  );
}

export default App;

/*import React, { useEffect, useState } from 'react';
import axios from 'axios';
import logo from './logo.svg';
import './App.css';

interface Pokemon {
  name: string;
  // Otros campos relevantes de un Pokemon
}

function App() {
  const [pokemonList, setPokemonList] = useState<Pokemon[]>([]);

  useEffect(() => {
    // Llamada a la API al montar el componente
    axios.get<Pokemon[]>('http://localhost:8080/pokemon')
      .then(response => setPokemonList(response.data))
      .catch(error => console.error('Error fetching data: ', error));
  }, []);  // El segundo parámetro [] asegura que useEffect solo se ejecute una vez al montar el componente.

  return (
    <div>
      <ul>
        {pokemonList.map(pokemon => (
          <li key={pokemon.name}>{pokemon.name}</li>
        ))}
      </ul>
    </div>
  );
}

export default App;*/


/*
import React from 'react';
import logo from './logo.svg';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;

*/
