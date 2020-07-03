import Screen from "../../../src/game/Screen.js";
import Tilemap from "../../../src/game/Tilemap.js";
import Helper from "../../../src/utils/Helper.js";

import Constants from "./Constants.js";
import Player from "./actors/Player.js";

class WorldScreen extends Screen {
	constructor() {
		super();

		/**
		 * Tilemap demo
		 */
		let tm = new Tilemap({
			sheet: "tileset",
			w: Constants.MAP_WIDTH,
			h: Constants.MAP_HEIGHT
		});
		tm.layer = 0;

		tm.each((tile) => {
			tile.set(Helper.choose([0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 243, 6, 7]));
		});

		this.add(tm);

		/**
		 * player
		 */
		this.player = new Player(0, 0);
		this.add(this.player);

		//this.addText();
	}

	addText() {
		// text sample
		// let textShadow = new Text({text: "ARPG", x: 4, y: 4, color: "#000000", useKerning: true});
		// textShadow.layer = 1;
		// this.add(textShadow);
	}

	update() {}

}

export default WorldScreen;