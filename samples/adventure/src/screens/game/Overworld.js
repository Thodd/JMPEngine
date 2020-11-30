import Screen from "../../../../../src/game/Screen.js";
import Tilemap from "../../../../../src/game/Tilemap.js";
import { exposeOnWindow } from "../../../../../src/utils/Helper.js";

import GameController from "./GameController.js";
import Player from "../../actors/player/Player.js";
import Constants from "../../Constants.js";
import GameTile from "../../levelgen/GameTile.js";
import Enemy from "../../actors/enemies/Enemy.js";
import RNG from "../../../../../src/utils/RNG.js";
import GameUI from "./GameUI.js";

class WorldScreen extends Screen {
	constructor() {
		super();

		RNG.seed(1337);

		this._ui = new GameUI(this);

		/**
		 * Tilemap
		 */
		this._tileMap = new Tilemap({sheet: "tileset", w: Constants.MAP_WIDTH, h: Constants.MAP_HEIGHT, tileClass: GameTile});
		this._tileMap.x = 0;
		this._tileMap.y = 0;
		this._tileMap.layer = Constants.Layers.TILES;

		this._tileMap.each((tile) => {
			tile.setType(GameTile.Types.FLOOR);
		});
		this._tileMap.get(12,12).setType(GameTile.Types.TREE);
		this._tileMap.get(14,12).setType(GameTile.Types.TREE);
		this._tileMap.get(10,8).setType(GameTile.Types.SIGN);

		this.add(this._tileMap);

		exposeOnWindow("tilemap", this._tileMap); // DEBUG reference on window


		// player
		this.player = new Player({gameTile: this._tileMap.get(10, 10)});
		this.add(this.player);

		// game controller
		this._gameController = new GameController(this);
		this._gameController.addPlayer(this.player);

		// some enemies
		for (let i = 0; i < 10; i++) {
			this.enemy = new Enemy({gameTile: this._tileMap.get(7, 7)});
			this.add(this.enemy);
			this._gameController.addActor(this.enemy);
		}
	}

	setup() {
		// fix UI layer to the camera
		this.setCameraFixedForLayer(Constants.Layers.UI_BG, true);
		this.setCameraFixedForLayer(Constants.Layers.UI_TEXT, true);
	}

	getTilemap() {
		return this._tileMap;
	}

	getGameController() {
		return this._gameController;
	}

	update() {
		// delegate logic update to the GameController
		// separates game-logic dependent activities from other things like UI, Menus etc.
		this._gameController.update();

		this._ui.updateData();
	}
}

export default WorldScreen;