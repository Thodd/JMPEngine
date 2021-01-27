import Tilemap from "../../../../../src/game/Tilemap.js";
import Helper from "../../../../../src/utils/Helper.js";
import { log, assert } from "../../../../../src/utils/Log.js";
import RNG from "../../../../../src/utils/RNG.js";

import RoomPatterns from "./RoomPatterns.js";
import Constants from "../../Constants.js";

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
	}
}


const OverworldGenerator = {

	_roomList: [],

	world: [],

	_init() {
		// we first loop Y so we have actual rows and then add the columns
		// this allows us to iterate the map from "top-left" to "bottom-right" in a "left->right" way...
		for (let y = 0; y < WORLD_HEIGHT; y++) {
			this.world[y] = [];
			for (let x = 0; x < WORLD_WIDTH; x++) {
				this.world[y][x] = new Room(x, y);
			}
		}
	},

	/**
	 * Iterates all Rooms in the World map.
	 * @param {function} fn callback executed for each Room
	 */
	each(fn) {
		for (let y = 0; y < WORLD_HEIGHT; y++) {
			for (let x = 0; x < WORLD_WIDTH; x++) {
				fn(this.world[y][x]);
			}
		}
	},

	/**
	 * Generate a new Overworld.
	 */
	generate() {
		RNG.seed(123456);

		this._init();

		// start with initial room in the center
		this.addRooms(40, [this.getRoom(x_center, y_center)]);

		// each room has an explicit patern describing its tile status
		this.calculateRoomPatterns();

		// debug minimap
		this.minimap = new Tilemap({
			sheet: "autotile",
			x: 20,
			y: 20,
			w: WORLD_WIDTH,
			h: WORLD_HEIGHT
		});
		this.minimap.layer = Constants.Layers.UI;

		this.each((r) => {
			this.minimap.get(r.x, r.y).set(RoomPatterns[r.pattern]);
		});
	},

	/**
	 * Retrieve the Room at (x,y).
	 * Or undefined if out of bounds.
	 */
	getRoom(x, y) {
		if (this.world[y]) {
			return this.world[y][x];
		} else {
			// out of bounds room
			return undefined;
		}
	},

	/**
	 * Returns all game relevant rooms.
	 * Ignores rooms which are just edges for making the world cohesive.
	 */
	getGameRooms() {
		return this._roomList;
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

	/**
	 * Recursively places Rooms at random, but making sure they are all connected to each other.
	 * Only advances in cardinal directions.
	 *
	 * @param {int} roomsLeft the number of rooms left to create
	 * @param {Room[]} possibleNextRooms a list of possible next room placements
	 */
	addRooms(roomsLeft, possibleNextRooms) {
		if (roomsLeft > 0 && possibleNextRooms.length > 0) {
			// take the first coordinates
			let room = possibleNextRooms.shift();
			if (room) {
				// fill the room & add neighbours
				if (!room.isFilled) {
					room.isFilled = true;

					// track all filled rooms
					this._roomList.push(room);

					// add neighbours
					let N = this.getValidRoom(room.x, room.y - 1);
					let E = this.getValidRoom(room.x + 1, room.y);
					let S = this.getValidRoom(room.x, room.y + 1);
					let W = this.getValidRoom(room.x - 1, room.y);
					if (N && !N.isFilled && possibleNextRooms.indexOf(N) < 0) {
						possibleNextRooms.push(N)
					}
					if (E && !E.isFilled && possibleNextRooms.indexOf(E) < 0) {
						possibleNextRooms.push(E)
					}
					if (S && !S.isFilled && possibleNextRooms.indexOf(S) < 0) {
						possibleNextRooms.push(S)
					}
					if (W && !W.isFilled && possibleNextRooms.indexOf(W) < 0) {
						possibleNextRooms.push(W)
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
	},

	/**
	 * Assigns the pattern string to each Room instance.
	 */
	calculateRoomPatterns() {

		function s(bool, part) {
			return bool ? part : "x";
		}

		function r(room) {
			return room && room.isFilled;
		}

		this.each((room) => {
			// filled rooms are always center pieces
			// we only need to calculate a pattern for the unfilled rooms, these are the outer edges of the map
			if (room.isFilled) {
				room.pattern = "NESW_ABCD";
				return;
			}

			// cardinals
			let N = r(this.getValidRoom(room.x + 0, room.y - 1));
			let E = r(this.getValidRoom(room.x + 1, room.y + 0));
			let S = r(this.getValidRoom(room.x + 0, room.y + 1));
			let W = r(this.getValidRoom(room.x - 1, room.y + 0));

			// diagonals
			let A, B, C, D;
			if (!N && !W) {
				A = r(this.getValidRoom(room.x - 1, room.y - 1));
			}

			if (!N && !E) {
				B = r(this.getValidRoom(room.x + 1, room.y - 1));
			}

			if (!S && !E) {
				C = r(this.getValidRoom(room.x + 1, room.y + 1));
			}

			if (!S && !W) {
				D = r(this.getValidRoom(room.x - 1, room.y + 1));
			}

			room.pattern = `${s(N, "N")}${s(E, "E")}${s(S, "S")}${s(W, "W")}_${s(A, "A")}${s(B, "B")}${s(C, "C")}${s(D, "D")}`;
		});
	}
};

export default OverworldGenerator;