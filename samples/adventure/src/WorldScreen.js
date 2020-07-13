import Screen from "../../../src/game/Screen.js";
import Tilemap from "../../../src/game/Tilemap.js";
import BitmapText from "../../../src/gfx/BitmapText.js";
import GFX from "../../../src/gfx/GFX.js";
import Buffer from "../../../src/gfx/Buffer.js";
import Helper from "../../../src/utils/Helper.js";
import GameController from "./GameController.js";
import Constants from "./Constants.js";

class WorldScreen extends Screen {
	constructor() {
		super();

		this.gameController = new GameController();

		this.add(this.gameController.player);

		/**
		 * Tilemap demo
		 */
		let tm = new Tilemap({sheet: "tileset", w: Constants.MAP_WIDTH, h: Constants.MAP_HEIGHT, version: Tilemap.Version.A});
		tm.x = 0;
		tm.y = 0;
		tm.layer = 1;

		tm.each((tile) => {
			tile.set(Helper.choose([1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 3, 4, 5]));
		});

		this.add(tm);

		// text sample
		let textShadow = new BitmapText({text: "JMP Adventure", x: 1, y: 122, color: "#000000", useKerning: true});
		textShadow.layer = 3;
		this.add(textShadow);

		let textColored = new BitmapText({text: "JMP Adventure", x: 0, y: 121, color: "#FFFFFF", useKerning: true});
		textColored.layer = 3;
		this.add(textColored);
	}

	update() {
		this.gameController.update();
	}

	setup() {
		//GFX.getBuffer(1).setRenderMode(Buffer.RenderModes.RAW);
		GFX.getBuffer(3).setCameraFixed(true);
	}
}

export default WorldScreen;