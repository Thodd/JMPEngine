import { char2id } from "../../utils/RLHelper.js";

import MapBase from "./MapBase.js";

import Constants from "../../Constants.js";
import Colors from "../../Colors.js";

class Overworld extends MapBase {
	constructor() {
		super({
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
	}

	/**
	 * Generate Overworld.
	 */
	_generate() {
		this.each((tile) => {
			let r = Math.random();
			if (r < 0.05) {
				tile.id = char2id("♠");
				tile.color = Colors[11];
			} else {
				tile.id = char2id(".");
				tile.color = Colors[10];
			}
			tile.background = Colors[9];
		});
	}

	/**
	 * Place the player on the Overworld the first time.
	 */
	_placePlayer() {
		let player = this.getPlayerActor();
		this.get(15, 15).addActor(player);
	}
}

export default Overworld;