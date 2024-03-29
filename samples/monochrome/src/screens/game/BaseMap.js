import Screen from "../../../../../src/game/Screen.js";
import Tilemap from "../../../../../src/game/Tilemap.js";
import { exposeOnWindow } from "../../../../../src/utils/Helper.js";
import RNG from "../../../../../src/utils/RNG.js";

import UISystem from "../../ui/UISystem.js";

import GameController from "../../controller/GameController.js";
import Cursor from "../../controller/Cursor.js";

import Player from "../../actors/player/Player.js";
import PlayerState from "../../actors/player/PlayerState.js";

import Constants from "../../Constants.js";

class BaseMap extends Screen {
	constructor(tilemapSpec) {
		super();

		// RNG seeding
		let seed = 12345678;
		RNG.seed(seed);
		UISystem.log(`New World generated using seed: <span style='color:#FF0085'>${seed}</span>.`);

		// creation lifecycle
		this.initTilemap(tilemapSpec);

		this.initControllers();

		this.generate();

		this.populate();

		this.positionPlayer();
		this.getPlayer().updateVisualPosition();
	}

	/**
	 * Engine Setup.
	 * Camera stuff.
	 */
	setup() {
		// fix UI layer to the camera
		this.setCameraFixedForLayer(Constants.Layers.UI_BG, true);
		this.setCameraFixedForLayer(Constants.Layers.UI_TEXT, true);
	}

	/**
	 * Connect UI Event Handlers to the currently active Player instance.
	 * This has to happen on every Screen change, so only the currently active
	 * Player instance is handling UI input events.
	 */
	begin() {
		this.getPlayer().connectEventHandlers();
	}

	/**
	 * Disconnect UI Event Handlers to the currently active Player instance.
	 * This has to happen on every Screen change, so only the currently active
	 * Player instance is handling UI input events.
	 */
	end() {
		this.getPlayer().disconnectEventHandlers();
	}

	/**
	 * Initializes the Tilemap for this Map Screen.
	 * @param {object} tilemapSpec config object for the Tilemap constructor
	 */
	initTilemap(tilemapSpec) {
		// create Tilemap
		this._tileMap = new Tilemap(tilemapSpec); //{sheet: "tileset", w: Constants.MAP_WIDTH, h: Constants.MAP_HEIGHT, tileClass: GameTile}
		exposeOnWindow("tilemap", this._tileMap); // DEBUG reference of Tilemap on window

		this._tileMap.x = 0;
		this._tileMap.y = 0;
		this._tileMap.layer = Constants.Layers.TILES;

		this.add(this._tileMap);
	}

	/**
	 * Creates the Player & GameController.
	 * All controllers are singletons inside their respective BaseMap context.
	 */
	initControllers() {
		// Create Player controller instance
		this._player = new Player({gameTile: this._tileMap.get(0, 0)});
		this.add(this._player);

		// Create Cursor controller instance
		this._cursor = new Cursor();
		this.add(this._cursor);

		// initialize the global PlayerState singleton
		// This happens always, but the class itself is guarded against multiple initializations
		PlayerState.init();

		// Create game controller instance
		this._gameController = new GameController(this);
		exposeOnWindow("gc", this._gameController); // DEBUG reference of GC on window
		this._gameController.addPlayer(this._player);

		// register GameController at the PlayerState
		PlayerState.setCurrentGameController(this._gameController);
	}

	/**
	 * Hook to generate a Map.
	 */
	generate() {}

	/**
	 * Hook to populate the Map with NPCs
	 */
	populate() {}

	/**
	 * Hook to place the player instance on the Map.
	 * Typically the Player's spawn point can only be determined after generation.
	 */
	positionPlayer() {}

	getTilemap() {
		return this._tileMap;
	}

	getPlayer() {
		return this._player;
	}

	getCursor() {
		return this._cursor;
	}

	getGameController() {
		return this._gameController;
	}

	/**
	 * Delegates logic update to the GameController.
	 * This separates game-logic dependent activities from other things like UI, Menus etc.
	 */
	update() {
		this._gameController.update();
	}

}

export default BaseMap;