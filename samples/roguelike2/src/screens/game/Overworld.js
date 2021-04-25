import Constants from "../../Constants.js";
import Screen from "../../../../../src/game/Screen.js";
import BitmapText from "../../.././../../src/game/BitmapText.js";

class Overworld extends Screen {
	constructor() {
		super();

		this.add(new BitmapText({
			font: "font0",
			text: "Hello World! :D",
			x: Constants.TILE_WIDTH,
			y: Constants.TILE_HEIGHT,
			color: 0x0085FF
		}));
	}
}

export default Overworld;