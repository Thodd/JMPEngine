import Screen from "../../../../../src/game/Screen.js";
import Tilemap from "../../../../../src/game/Tilemap.js";
import { exposeOnWindow } from "../../../../../src/utils/Helper.js";

import BitmapText from "../../../../../src/game/BitmapText.js";

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
		exposeOnWindow("tilemap", this._tileMap); // DEBUG reference of Tilemap on window

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

		// player
		this._player = new Player({gameTile: this._tileMap.get(10, 10)});
		this.add(this._player);

		// game controller
		this._gameController = new GameController(this);
		exposeOnWindow("gc", this._gameController); // DEBUG reference of GC on window
		this._gameController.addPlayer(this._player);

		// some enemies
		for (let i = 0; i < 20; i++) {
			this.enemy = new Enemy({gameTile: this._tileMap.get(7, 7)});
			this.add(this.enemy);
			this._gameController.addActor(this.enemy);
		}

		// this.enemy = new Enemy({gameTile: this._tileMap.get(7, 7)});
		// this.add(this.enemy);
		// this._gameController.addActor(this.enemy);

		// this.enemy = new Enemy({gameTile: this._tileMap.get(8, 6)});
		// this.add(this.enemy);
		// this._gameController.addActor(this.enemy);

		// this.enemy = new Enemy({gameTile: this._tileMap.get(9, 7)});
		// this.add(this.enemy);
		// this._gameController.addActor(this.enemy);

		// testing texts for log
		let bmpText = new BitmapText({
			text: "You hit the Snake for 5dmg.",
			color: Constants.Colors.CREME,
			font: "font0"
		});
		bmpText.x = 4;
		bmpText.y = 140;
		bmpText.layer = Constants.Layers.UI_TEXT;
		this.add(bmpText);
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

		this._ui.updateData();
	}
}

export default WorldScreen;