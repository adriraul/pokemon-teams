import { PokemonController } from "./controller/PokemonController";
import { PokemonTypesController } from "./controller/PokemonTypesController";
import { TeamController } from "./controller/TeamController";
import { BoxController } from "./controller/BoxController";
import { UserController } from "./controller/UserController";
import authenticateJWT from "./middleware/auth";

export const Routes = [
  {
    method: "get",
    route: "/pokemon",
    controller: PokemonController,
    action: "all",
    middleware: [authenticateJWT],
  },
  {
    method: "post",
    route: "/pokemon/all",
    controller: PokemonController,
    action: "saveAll",
    middleware: [authenticateJWT],
  },
  {
    method: "get",
    route: "/pokemon/:id",
    controller: PokemonController,
    action: "one",
  },
  {
    method: "post",
    route: "/pokemon",
    controller: PokemonController,
    action: "save",
    middleware: [authenticateJWT],
  },
  {
    method: "delete",
    route: "/pokemon/:id",
    controller: PokemonController,
    action: "remove",
    middleware: [authenticateJWT],
  },
  {
    method: "post",
    route: "/user/login",
    controller: UserController,
    action: "login",
  },
  {
    method: "get",
    route: "/user",
    controller: UserController,
    action: "all",
    middleware: [authenticateJWT],
  },
  {
    method: "get",
    route: "/user/allPokemons",
    controller: UserController,
    action: "allPokemons",
    middleware: [authenticateJWT],
  },
  {
    method: "get",
    route: "/user/allTeams",
    controller: UserController,
    action: "allTeams",
    middleware: [authenticateJWT],
  },
  {
    method: "get",
    route: "/user/allBoxes",
    controller: UserController,
    action: "allBoxes",
    middleware: [authenticateJWT],
  },
  {
    method: "get",
    route: "/user/:id",
    controller: UserController,
    action: "one",
    middleware: [authenticateJWT],
  },
  {
    method: "post",
    route: "/user",
    controller: UserController,
    action: "register",
  },
  {
    method: "post",
    route: "/user/addPokemonToUser",
    controller: UserController,
    action: "addPokemonToUser",
    middleware: [authenticateJWT],
  },
  {
    method: "delete",
    route: "/user/removePokemonFromUser",
    controller: UserController,
    action: "removePokemonFromUser",
    middleware: [authenticateJWT],
  },
  {
    method: "delete",
    route: "/user/:id",
    controller: UserController,
    action: "remove",
    middleware: [authenticateJWT],
  },
  {
    method: "get",
    route: "/pokemonTypes",
    controller: PokemonTypesController,
    action: "all",
  },
  {
    method: "get",
    route: "/pokemonTypes/:id",
    controller: PokemonTypesController,
    action: "one",
  },
  {
    method: "post",
    route: "/pokemonTypes",
    controller: PokemonTypesController,
    action: "save",
    middleware: [authenticateJWT],
  },
  {
    method: "post",
    route: "/pokemonTypes/all",
    controller: PokemonTypesController,
    action: "saveAll",
    middleware: [authenticateJWT],
  },
  {
    method: "delete",
    route: "/pokemonTypes/:id",
    controller: PokemonTypesController,
    action: "remove",
    middleware: [authenticateJWT],
  },
  {
    method: "get",
    route: "/team",
    controller: TeamController,
    action: "all",
    middleware: [authenticateJWT],
  },
  {
    method: "get",
    route: "/team/:id",
    controller: TeamController,
    action: "one",
    middleware: [authenticateJWT],
  },
  {
    method: "post",
    route: "/team",
    controller: TeamController,
    action: "save",
    middleware: [authenticateJWT],
  },
  {
    method: "post",
    route: "/team/addPokemon",
    controller: TeamController,
    action: "addPokemonToTeam",
    middleware: [authenticateJWT],
  },
  {
    method: "delete",
    route: "/team/removePokemon",
    controller: TeamController,
    action: "removePokemonFromTeam",
    middleware: [authenticateJWT],
  },
  {
    method: "delete",
    route: "/team/:id",
    controller: TeamController,
    action: "remove",
    middleware: [authenticateJWT],
  },
  {
    method: "get",
    route: "/box",
    controller: BoxController,
    action: "all",
    middleware: [authenticateJWT],
  },
  {
    method: "get",
    route: "/box/:id",
    controller: BoxController,
    action: "one",
    middleware: [authenticateJWT],
  },
  {
    method: "post",
    route: "/box",
    controller: BoxController,
    action: "save",
    middleware: [authenticateJWT],
  },
  {
    method: "post",
    route: "/box/addPokemon",
    controller: BoxController,
    action: "addPokemonToBox",
    middleware: [authenticateJWT],
  },
  {
    method: "delete",
    route: "/box/removePokemon",
    controller: BoxController,
    action: "removePokemonFromBox",
    middleware: [authenticateJWT],
  },
  {
    method: "delete",
    route: "/box/:id",
    controller: BoxController,
    action: "remove",
    middleware: [authenticateJWT],
  },
];
