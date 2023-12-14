import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./views/Home";
import Pokedex from "./views/Pokedex";
import MainNav from "./components/MainNav";

function App() {
  return (
    <Routes>
      <Route path="/" element={<MainNav />}>
        <Route index element={<Home />} />
        <Route path="/pokedex" element={<Pokedex />} />
      </Route>
    </Routes>
  );
}

export default App;
