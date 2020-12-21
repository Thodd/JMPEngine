import Screen from "../../../../../src/game/Screen.js";
import Tilemap from "../../../../../src/game/Tilemap.js";
import { exposeOnWindow } from "../../../../../src/utils/Helper.js";

import GameController from "../../controller/GameController.js";
import Player from "../../actors/player/Player.js";
import Constants from "../../Constants.js";
import GameTileTypes from "../../levelgen/GameTileTypes.js";
import GameTile from "../../levelgen/GameTile.js";

import RNG from "../../../../../src/utils/RNG.js";
import Helper from "../../../../../src/utils/Helper.js";

import Snake from "../../actors/enemies/Snake.js";
import Wolf from "../../actors/enemies/Wolf.js";
import UISystem from "../../ui/UISystem.js";

class WorldScreen extends Screen {
	constructor() {
		super();

		let seed = 12345678;
		RNG.seed(seed);
		UISystem.showSeed(seed);

		/**
		 * Tilemap
		 */
		this._tileMap = new Tilemap({sheet: "tileset", w: Constants.MAP_WIDTH, h: Constants.MAP_HEIGHT, tileClass: GameTile});
		exposeOnWindow("tilemap", this._tileMap); // DEBUG reference of Tilemap on window

		this._tileMap.x = 0;
		this._tileMap.y = 0;
		this._tileMap.layer = Constants.Layers.TILES;

		this._tileMap.each((tile) => {
			tile.setType(GameTileTypes.FLOOR);
		});
		this._tileMap.get(12,12).setType(GameTileTypes.TREE);
		this._tileMap.get(14,12).setType(GameTileTypes.TREE);
		this._tileMap.get(10,8).setType(GameTileTypes.SIGN);

		this._tileMap.get(12,8).setType(GameTileTypes.BUSH);
		this._tileMap.get(13,8).setType(GameTileTypes.BUSH);
		this._tileMap.get(14,8).setType(GameTileTypes.BUSH);

		this.add(this._tileMap);

		// player
		this._player = new Player({gameTile: this._tileMap.get(10, 10)});
		this.add(this._player);

		// game controller
		this._gameController = new GameController(this);
		exposeOnWindow("gc", this._gameController); // DEBUG reference of GC on window
		this._gameController.addPlayer(this._player);

		// some enemies
		for (let i = 0; i < 10; i++) {
			let EnemyClass = Helper.choose([Snake, Wolf]);
			this.enemy = new EnemyClass({gameTile: this._tileMap.get(7, 7)});
			this.add(this.enemy);
			this._gameController.getTimeline().addActor(this.enemy);
		}

		// this.enemy = new Snake({gameTile: this._tileMap.get(7, 7)});
		// this.add(this.enemy);
		// this._gameController.getTimeline().addActor(this.enemy);

		// this.enemy = new Snake({gameTile: this._tileMap.get(8, 6)});
		// this.add(this.enemy);
		// this._gameController.getTimeline().addActor(this.enemy);

		// this.enemy = new Wolf({gameTile: this._tileMap.get(9, 7)});
		// this.add(this.enemy);
		// this._gameController.getTimeline().addActor(this.enemy);
	}

	setup() {
		// fix UI layer to the camera
		this.setCameraFixedForLayer(Constants.Layers.UI_BG, true);
		this.setCameraFixedForLayer(Constants.Layers.UI_TEXT, true);
	}

	getTilemap() {
		return this._tileMap;
	}

	getPlayer() {
		return this._player;
	}

	getGameController() {
		return this._gameController;
	}

	update() {
		// delegate logic update to the GameController
		// separates game-logic dependent activities from other things like UI, Menus etc.
		this._gameController.update();
	}
}

export default WorldScreen;