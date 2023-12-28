import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./views/Home";
import Pokedex from "./views/Pokedex";
import MainNav from "./components/MainNav";
import Login from "./views/Login";
import Register from "./views/Register";
import RequireAuth from "./components/RequireAuth";
//import Box from "./views/Box";
//<Route path="/boxes" element={<Box />} />
function App() {
  return (
    <Routes>
      <Route path="/" element={<MainNav />}>
        <Route index element={<Home />} />
        <Route element={<RequireAuth />}>
          <Route path="/pokedex" element={<Pokedex />} />
        </Route>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>
    </Routes>
  );
}

export default App;
