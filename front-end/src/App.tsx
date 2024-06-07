import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./views/Home";
import Pokedex from "./views/Pokedex";
import MainNav from "./components/MainNav";
import Login from "./views/Login";
import Register from "./views/Register";
import RequireAuth from "./components/RequireAuth";
import Boxes from "./views/Boxes";
import Teams from "./views/Teams";
import Pokeballs from "./views/Pokeballs";
import Level from "./views/Level";
import { ToastContainer } from "react-toastify";
import Game from "./views/Game";

function App() {
  return (
    <>
      <ToastContainer position="bottom-right" />
      <Routes>
        <Route path="/" element={<MainNav />}>
          <Route index element={<Home />} />
          <Route element={<RequireAuth />}>
            <Route path="/pokedex" element={<Pokedex />} />
          </Route>
          <Route element={<RequireAuth />}>
            <Route path="/game" element={<Game />} />
            <Route path="/level/:levelId" element={<Level />} />
          </Route>
          <Route element={<RequireAuth />}>
            <Route path="/boxes" element={<Boxes />} />
          </Route>
          <Route element={<RequireAuth />}>
            <Route path="/teams" element={<Teams />} />
          </Route>
          <Route element={<RequireAuth />}>
            <Route path="/pokeballs" element={<Pokeballs />} />
          </Route>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
