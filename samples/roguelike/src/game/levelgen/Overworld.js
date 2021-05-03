import Helper from "../../../../../src/utils/Helper.js";
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
			tile.id = Helper.choose([char2id("."), char2id("."), char2id("."), char2id("."), char2id("."),char2id(","), char2id("."), char2id("."), char2id("."), char2id("♠")]);
			// tile.id = Helper.choose([36, 36, 36, 44, 44, 44, 44, 44, 33, 33, 33, 33, 96]);
			tile.color = Colors[11];
			tile.background = Colors[9];
		});
	}

	/**
	 * Place the player on the Overworld the first time.
	 */
	_placePlayer() {
		let player = this.getPlayerActor();
		this.get(10, 10).addActor(player);
	}
}

export default Overworld;