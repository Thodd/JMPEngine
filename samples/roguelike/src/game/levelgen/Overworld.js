import { log } from "../../../../../src/utils/Log.js";
import { char2id } from "../../utils/RLHelper.js";

import MapBase from "./MapBase.js";

import RoomLayoutGenerator from "../levelgen/RoomLayoutGenerator.js";
import Constants from "../../Constants.js";
import Colors from "../../Colors.js";

class Overworld extends MapBase {
	constructor() {
		super({
			sheet: "tileset",

			// the RLMap's maximum dimensions are calculated based on the room# and the viewport size
			w: Constants.VIEWPORT_WIDTH * Constants.OVERWORLD_ROOM_COLUMNS,
			h: Constants.VIEWPORT_HEIGHT * Constants.OVERWORLD_ROOM_ROWS,

			viewport: {
				x: 0,
				y: 0,
				w: Constants.VIEWPORT_WIDTH,
				h: Constants.VIEWPORT_HEIGHT
			}
		});

		// debugging logs, helpful to see the dimensions of the generated map
		log("generated.", "Overworld");
		log(`Map dimensions (in Rooms): w=${Constants.OVERWORLD_ROOM_COLUMNS}, h=${Constants.OVERWORLD_ROOM_ROWS}.`, "Overworld");
		log(`Map dimensions (in tiles): w=${this._config.w}, h=${this._config.h}.`, "Overworld");
		log(`Viewport dimensions (in tiles): w=${Constants.VIEWPORT_WIDTH}, h=${Constants.VIEWPORT_HEIGHT}.`, "Overworld");
	}

	/**
	 * Returns the RoomLayoutGenerator for this Overworld instance.
	 * The RoomLayoutGenerator contains a list of all available Rooms which can be used for the game.
	 * @returns {RoomLayoutGenerator}
	 */
	getRoomLayoutGenerator() {
		return this.roomLayoutGenerator;
	}

	/**
	 * Generate Overworld.
	 */
	generate() {
		// create a random room layout
		this.roomLayoutGenerator = new RoomLayoutGenerator(Constants.OVERWORLD_ROOM_COLUMNS, Constants.OVERWORLD_ROOM_ROWS);
		this.roomLayoutGenerator.generate();

		// TODO: enrich Rooms with actual tile-coordinate information for scrolling.
		//       The RoomLayoutGenerator should not do this, it only operates on a smaller scaled grid (rows/cols)

		// TODO: Make this based on the room list, NOT the complete map
		// fill with tiles
		this.each((tile) => {
			let r = Math.random();
			if (r < 0.05) {
				tile.id = char2id("♠");
				tile.color = Colors[11];
			} else {
				tile.id = char2id(".");
				tile.color = Colors[1];
			}
			tile.background = Colors[9];
		});
	}

	/**
	 * Place the player on the Overworld the first time.
	 */
	placePlayer() {
		let player = this.getPlayerActor();
		this.get(15, 15).addActor(player);
	}
}

export default Overworld;