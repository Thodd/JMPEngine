import Engine from "../../../src/Engine.js";
import Entity from "../../../src/game/Entity.js";

import BaseLevel from "./Level/BaseLevel.js";
import Player from "./Actors/Player.js";

Entity.RENDER_HITBOXES = "#FF0085";

// base level
Engine.screen = new BaseLevel();

// create player
let player = new Player();
window.player = player;
Engine.screen.add(player);