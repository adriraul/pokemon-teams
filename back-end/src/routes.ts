import { PokemonController } from "./controller/PokemonController"
import { PokemonTypesController } from "./controller/PokemonTypesController"
import { TeamController } from "./controller/TeamController"
import { BoxController } from "./controller/BoxController"

export const Routes = [{
    method: "get",
    route: "/pokemon",
    controller: PokemonController,
    action: "all"
}, 
{
    method: "post",
    route: "/pokemon/all",
    controller: PokemonController,
    action: "saveAll"
}, {
    method: "get",
    route: "/pokemon/:id",
    controller: PokemonController,
    action: "one"
}, {
    method: "post",
    route: "/pokemon",
    controller: PokemonController,
    action: "save"
}, {
    method: "delete",
    route: "/pokemon/:id",
    controller: PokemonController,
    action: "remove"
},{
    method: "get",
    route: "/pokemonTypes",
    controller: PokemonTypesController,
    action: "all"
}, {
    method: "get",
    route: "/pokemonTypes/:id",
    controller: PokemonTypesController,
    action: "one"
}, {
    method: "post",
    route: "/pokemonTypes",
    controller: PokemonTypesController,
    action: "save"
}, {
    method: "post",
    route: "/pokemonTypes/all",
    controller: PokemonTypesController,
    action: "saveAll"
}, {
    method: "delete",
    route: "/pokemonTypes/:id",
    controller: PokemonTypesController,
    action: "remove"
},{
    method: "get",
    route: "/team",
    controller: TeamController,
    action: "all"
}, {
    method: "get",
    route: "/team/:id",
    controller: TeamController,
    action: "one"
}, {
    method: "post",
    route: "/team",
    controller: TeamController,
    action: "save"
},{
    method: "post",
    route: "/team/addPokemon",
    controller: TeamController,
    action: "addPokemonToTeam"
},{
    method: "delete",
    route: "/team/removePokemon",
    controller: TeamController,
    action: "removePokemonFromTeam"
},{
    method: "delete",
    route: "/team/:id",
    controller: TeamController,
    action: "remove"
},{
    method: "get",
    route: "/box",
    controller: BoxController,
    action: "all"
},{
    method: "get",
    route: "/box/:id",
    controller: BoxController,
    action: "one"
},{
    method: "post",
    route: "/box",
    controller: BoxController,
    action: "save"
},{
    method: "post",
    route: "/box/addPokemon",
    controller: BoxController,
    action: "addPokemonToBox"
}, {
    method: "delete",
    route: "/box/removePokemon",
    controller: BoxController,
    action: "removePokemonFromBox"
},{
    method: "delete",
    route: "/box/:id",
    controller: BoxController,
    action: "remove"
}]