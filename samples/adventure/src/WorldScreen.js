import Screen from "../../../src/game/Screen.js";
import Tilemap from "../../../src/game/Tilemap.js";
import BitmapText from "../../../src/game/BitmapText.js";
import Helper from "../../../src/utils/Helper.js";

import GameController from "./GameController.js";
import Player from "./actors/Player.js";
import Constants from "./Constants.js";
import GameTile from "./maps/GameTile.js";
import NPC from "./actors/NPC.js";

class WorldScreen extends Screen {
	constructor() {
		super();

		/**
		 * Tilemap demo
		 */
		this._tileMap = new Tilemap({sheet: "tileset", w: Constants.MAP_WIDTH, h: Constants.MAP_HEIGHT, tileClass: GameTile});
		this._tileMap.x = 0;
		this._tileMap.y = 0;
		this._tileMap.layer = 1;

		this._tileMap.each((tile) => {
			tile.set(Helper.choose([1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 6, 7, 8, 9, 12, 14]));
		});

		this.add(this._tileMap);

		// player
		this.player = new Player({gameTile: this._tileMap.get(10, 10)});
		this.add(this.player);

		// game controller
		this._gameController = new GameController(this);
		this._gameController.addPlayer(this.player);

		// sample actor
		for (let i = 0; i < 10; i++) {
			this.enemy = new NPC({gameTile: this._tileMap.get(7, 7)});
			this.add(this.enemy);
			this._gameController.addActor(this.enemy);
		}
	}

	update() {
		// delegate logic update to the GameController
		// separates game-logic dependent activities from other things like UI, Menus etc.
		this._gameController.update();
	}

	setup() {
		this.setCameraFixedForLayer(3, true);
	}

	getTilemap() {
		return this._tileMap;
	}

	getGameController() {
		return this._gameController;
	}
}

export default WorldScreen;