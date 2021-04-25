import Constants from "../../Constants.js";
import Screen from "../../../../../src/game/Screen.js";

import RLMap from "../../core/RLMap.js";
import BitmapText from "../../../../../src/game/BitmapText.js";

class Overworld extends Screen {
	constructor() {
		super();

		let firstMap = new RLMap({
			sheet: "tileset",
			w: Constants.MAP_WIDTH,
			h: Constants.MAP_HEIGHT,
			viewport: {
				x: 0,
				y: 0,
				w: Constants.MAP_VIEWPORT_WIDTH,
				h: Constants.MAP_VIEWPORT_HEIGHT
			}
		});
		firstMap.each((tile) => {
			tile.set(35);
			tile.setColor(0x444444);
		});
		this.add(firstMap);

		this.add(new BitmapText({
			font: "font1",
			text: "Hello World! :D",
			x: Constants.TILE_WIDTH,
			y: Constants.TILE_HEIGHT,
			color: 0x0085FF
		}));
	}
}

export default Overworld;