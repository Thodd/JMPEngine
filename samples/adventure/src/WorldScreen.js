import Screen from "../../../src/game/Screen.js";
import Tilemap from "../../../src/game/Tilemap.js";
import BitmapText from "../../../src/game/BitmapText.js";
import Helper, { exposeOnWindow } from "../../../src/utils/Helper.js";

import GameController from "./GameController.js";
import Player from "./actors/Player.js";
import Constants from "./Constants.js";
import GameTile from "./maps/GameTile.js";
import NPC from "./actors/NPC.js";
import RNG from "../../../src/utils/RNG.js";

class WorldScreen extends Screen {
	constructor() {
		super();

		RNG.seed(1337);

		/**
		 * Tilemap demo
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

		exposeOnWindow("tilemap", this._tileMap);

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


		// text test
		let bmpTxt = new BitmapText({
			x: 5, y: 5,
			leading: 1,
			text: "I'm really not sure if this\nis a good idea...",
			color: Constants.Colors.CREME,
			font: "font0"
		});
		bmpTxt.layer = Constants.Layers.UI;
		this.add(bmpTxt);
	}

	update() {
		// delegate logic update to the GameController
		// separates game-logic dependent activities from other things like UI, Menus etc.
		this._gameController.update();
	}

	setup() {
		this.setCameraFixedForLayer(Constants.Layers.UI, true);
	}

	getTilemap() {
		return this._tileMap;
	}

	getGameController() {
		return this._gameController;
	}
}

export default WorldScreen;