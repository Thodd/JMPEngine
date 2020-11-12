import Screen from "../../../src/game/Screen.js";
import Tilemap from "../../../src/game/Tilemap.js";
import BitmapText from "../../../src/game/BitmapText.js";
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
		let tm = new Tilemap({sheet: "tileset", w: Constants.MAP_WIDTH, h: Constants.MAP_HEIGHT});
		tm.x = 0;
		tm.y = 0;
		tm.layer = 1;

		tm.each((tile) => {
			tile.set(Helper.choose([1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 3, 4, 5]));
		});

		this.add(tm);

		let textColored = new BitmapText({font:"font1", text: "JMP Adventure", x: 0, y: 121});
		textColored.layer = 3;
		this.add(textColored);
	}

	update() {
		this.gameController.update();
	}

	setup() {
		this.setCameraFixedForLayer(3, true);
	}
}

export default WorldScreen;