import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./views/Home";
import Pokedex from "./views/Pokedex";
import MainNav from "./components/MainNav";
import Login from "./views/Login";
import Register from "./views/Register";
import RequireAuth from "./components/RequireAuth";
import Pokeballs from "./views/Pokeballs";
import Level from "./views/Level";
import { ToastContainer } from "react-toastify";
import Game from "./views/Game";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import AvatarCustomizer from "./views/AvatarCustomizer";
import BoxesAndTeams from "./views/BoxesAndTeams";
import Laboratory from "./views/Laboratory";

function App() {
  return (
    <>
      <DndProvider backend={HTML5Backend}>
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
              <Route path="/laboratory" element={<Laboratory />} />
            </Route>
            <Route element={<RequireAuth />}>
              <Route path="/pokeballs" element={<Pokeballs />} />
            </Route>
            <Route element={<RequireAuth />}>
              <Route path="/pokemon" element={<BoxesAndTeams />} />
            </Route>
            <Route element={<RequireAuth />}>
              <Route
                path="/customize-avatar"
                element={<AvatarCustomizer />}
              ></Route>
            </Route>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>
        </Routes>
      </DndProvider>
    </>
  );
}

export default App;
