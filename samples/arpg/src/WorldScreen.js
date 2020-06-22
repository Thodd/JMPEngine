import Screen from "../../../src/game/Screen.js";
import Tilemap from "../../../src/game/Tilemap.js";
import Text from "../../../src/gfx/Text.js";
import GFX from "../../../src/gfx/GFX.js";
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
			tile.set(Helper.choose([0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 163, 7, 8]));
		});

		this.add(tm);

		/**
		 * player
		 */
		this.player = new Player({x: 20, y: 20});
		this.add(this.player);



		this.addText();
	}

	setup() {
		//GFX.getBuffer(0).setRenderMode(Buffer.RenderModes.RAW);
		GFX.getBuffer(2).setCameraFixed(true);
	}

	addText() {
		// text sample
		let textShadow = new Text({text: "ARPG", x: 4, y: 4, color: "#000000", useKerning: true});
		textShadow.layer = 1;
		this.add(textShadow);
	}

	update() {}

	render() {
		// HUD BG
		let g = GFX.get(1);
		g.rectf(0, 0, 160, 16, "#fdf0d1");
	}

}

export default WorldScreen;