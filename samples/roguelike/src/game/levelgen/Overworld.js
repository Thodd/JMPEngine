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
		this.roomLayoutGenerator = new RoomLayoutGenerator(this, Constants.OVERWORLD_ROOM_COLUMNS, Constants.OVERWORLD_ROOM_ROWS);
		this.roomLayoutGenerator.generate();

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
	 * Place the player on the Overworld for the first time.
	 */
	placePlayer() {
		let centerRoom = this.roomLayoutGenerator.getCenterRoom();
		let dim = centerRoom.dimensions;

		// place player in their first room
		let player = this.getPlayerActor();
		player.setRoom(centerRoom);

		// place player in the overall map
		this.get(dim.x_min + 15, dim.y_min + 15).addActor(player);

		// initial viewport is in the centerRoom of the world map
		this.viewport.x = dim.x_min;
		this.viewport.y = dim.y_min;
	}
}

export default Overworld;