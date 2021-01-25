import Tilemap from "../../../../src/game/Tilemap.js";
import Helper from "../../../../src/utils/Helper.js";
import { log, assert } from "../../../../src/utils/Log.js";

import Constants from "../Constants.js";

// map width and height should be odd numbers!
const MAX_MAP_WIDTH = 11;
const MAX_MAP_HEIGHT = 11;

assert(MAX_MAP_WIDTH % 2 == 1 && MAX_MAP_HEIGHT % 2 == 1, "Max. Map width/height must be odd numbers", "OverworldGenerator");

// The world is 2 room sizes bigger than the maximum map size,
// because we need to add the edge rooms on the outside -> similar to a padding
const WORLD_WIDTH = MAX_MAP_WIDTH + 2;
const WORLD_HEIGHT = MAX_MAP_HEIGHT + 2;

// constants for easier use when placing rooms
const x_origin = 1;
const y_origin = 1;
const x_max = x_origin + MAX_MAP_WIDTH;
const y_max = y_origin + MAX_MAP_HEIGHT;

// center room origin
const x_center = (WORLD_WIDTH - 1) / 2;
const y_center = (WORLD_HEIGHT - 1) / 2;


class Room {
	constructor(x, y) {
		this.x = x;
		this.y = y;

		this.isFilled = false;

		this.S = null;
		this.W = null;
		this.N = null;
		this.E = null;

		this.SW = null;
		this.NW = null;
		this.NE = null;
		this.SE = null;
	}
}


const OverworldGenerator = {

	roomList: [],

	world: [],

	init() {
		for (let x = 0; x < WORLD_WIDTH; x++) {
			this.world[x] = [];
			for (let y = 0; y < WORLD_WIDTH; y++) {
				this.world[x][y] = new Room(x, y);
			}
		}
	},

	generate() {
		this.init();

		// start with initial room in the center
		this.addRooms(20, [this.getRoom(x_center, y_center)]);

		// debug minimap
		this.minimap = new Tilemap({
			sheet: "minimap_tiles",
			x: 20,
			y: 20,
			w: WORLD_WIDTH,
			h: WORLD_HEIGHT
		});
		this.minimap.layer = Constants.Layers.UI;

		this.minimap.each((t) => {
			t.set(0);
		});

		this.roomList.forEach((r) => {
			this.minimap.get(r.x, r.y).set(2);
		});
	},

	getRoom(x, y) {
		if (this.world[x]) {
			return this.world[x][y];
		} else {
			// out of bounds room
			return undefined;
		}
	},

	/**
	 * Retreives a valid room inside the inner-bounds.
	 * Keeps 1 room as padding to the world width/height.
	 * @param {int} x
	 * @param {int} y
	 */
	getValidRoom(x, y) {
		if (x >= x_origin && x < x_max &&
			y >= y_origin && y < y_max) {
			return this.getRoom(x, y);
		} else {
			// out of "valid bounds"
			return undefined;
		}
	},

	addRooms(roomsLeft, possibleNextRooms) {
		if (roomsLeft > 0 && possibleNextRooms.length > 0) {
			// take the first coordinates
			let room = possibleNextRooms.shift();
			if (room) {
				// fill the room & add neighbours
				if (!room.isFilled) {
					room.isFilled = true;

					// track all filled rooms
					this.roomList.push(room);

					// add neighbours
					room.N = this.getValidRoom(room.x, room.y - 1);
					room.E = this.getValidRoom(room.x + 1, room.y);
					room.S = this.getValidRoom(room.x, room.y + 1);
					room.W = this.getValidRoom(room.x - 1, room.y);
					if (room.N && !room.N.isFilled && possibleNextRooms.indexOf(room.N) < 0) {
						possibleNextRooms.push(room.N)
					}
					if (room.E && !room.E.isFilled && possibleNextRooms.indexOf(room.E) < 0) {
						possibleNextRooms.push(room.E)
					}
					if (room.S && !room.S.isFilled && possibleNextRooms.indexOf(room.S) < 0) {
						possibleNextRooms.push(room.S)
					}
					if (room.W && !room.W.isFilled && possibleNextRooms.indexOf(room.W) < 0) {
						possibleNextRooms.push(room.W)
					}

					Helper.shuffle(possibleNextRooms);

					this.addRooms(--roomsLeft, possibleNextRooms);
				}
			} else {
				// broken, must be debugged
				// eslint-disable-next-line no-debugger
				debugger;
			}
		} else {
			log("Rooms placed.", "OverworldGenerator");
		}
	}
};

export default OverworldGenerator;