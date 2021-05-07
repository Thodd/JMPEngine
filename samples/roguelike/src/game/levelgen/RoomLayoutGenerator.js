import Tilemap from "../../../../../src/game/Tilemap.js";
import Helper from "../../../../../src/utils/Helper.js";
import { log, warn } from "../../../../../src/utils/Log.js";
import RNG from "../../../../../src/utils/RNG.js";
import Colors from "../../Colors.js";

import Constants from "../../Constants.js";
import { char2id } from "../../utils/RLHelper.js";

const _adjacentMapping = {
	"0-1":  "N",
	"1-1":  "NE",
	"10":   "E",
	"11":   "SE",
	"01":   "S",
	"-11":  "SW",
	"-10":  "W",
	"-1-1": "NW"
};

class Room {
	constructor(x, y) {
		this.x = x;
		this.y = y;

		// directional references to all adjacent rooms
		// can be accessed roomInstance["SW"] or via getAdjacent(0, -1).
		this.N = null;
		this.NE = null;
		this.E = null;
		this.SE = null;
		this.S = null;
		this.SW = null;
		this.W = null;
		this.NW = null;

		this.isFilled = false;
	}

	/**
	 * Safely retrieves an adjacent Room to this instance.
	 * Only Rooms in the Moore neighborhood can be retrieved this way.
	 * @param {int} x x delta: 0, 1 or -1
	 * @param {int} y y delta: 0, 1 or -1
	 * @returns {Room|null} the adjacent room or null if no room is present at the given coordinates
	 */
	getAdjacent(x, y) {
		let dir = _adjacentMapping[`${x}${y}`];
		if (dir) {
			return this[dir];
		} else {
			warn(`Cannot get adjacent Room outside the Moore neighborhood: (${x},${y}).`, "RoomLayoutGenerator.Room");
		}
	}
}

/**
 * Generates a Room Layout.
 */
class RoomLayoutGenerator {
	constructor(mapRoomColumns, mapRoomRows) {
		this.mapRoomColumns = mapRoomColumns;
		this.mapRoomRows = mapRoomRows;

		// center room origin
		this.x_center = (this.mapRoomColumns - 1) / 2;
		this.y_center = (this.mapRoomRows - 1) / 2;

		this._roomList = [];
		this.world = [];

		for (let x = 0; x < this.mapRoomColumns; x++) {
			this.world[x] = [];
			for (let y = 0; y < this.mapRoomRows; y++) {
				this.world[x][y] = new Room(x, y);
			}
		}
	}

	/**
	 * Iterates all Rooms in the World map.
	 * @param {function} fn callback executed for each Room
	 */
	each(fn) {
		// we first loop Y so we have actual rows and then add the columns
		// this allows us to iterate the map from "top-left" to "bottom-right" in a "left->right" way...
		for (let y = 0; y < this.mapRoomRows; y++) {
			for (let x = 0; x < this.mapRoomColumns; x++) {
				fn(this.world[x][y]);
			}
		}
	}

	/**
	 * Generate a new Overworld.
	 */
	generate() {
		RNG.seed(1234567);

		// start with initial room in the center
		this.addRooms(30, [this.getRoom(this.x_center, this.y_center)]);

		// debug minimap
		this.minimap = new Tilemap({
			sheet: "minimap",
			x: 0,
			y: 0,
			w: this.mapRoomColumns,
			h: this.mapRoomRows
		});
		this.minimap.layer = Constants.Layers.UI;

		this.each((r) => {
			let id = r.isFilled ? char2id("♠") : char2id("≈");
			let color = r.isFilled ? Colors[3] : Colors[2];
			let tile = this.minimap.get(r.x, r.y);
			tile.set(id);
			tile.setColor(color);
		});

		this.minimap.get(5,5).set(char2id("⌂"));
		this.minimap.get(5,5).setColor("0xeeeeee");

		this.minimap.get(3,5).set(char2id("@"));
		this.minimap.get(3,5).setColor(Colors[6]);
	}

	/**
	 * Retrieve the Room at (x,y).
	 * Or undefined if out of bounds.
	 */
	getRoom(x, y) {
		if (this.world[x]) {
			return this.world[x][y];
		} else {
			// out of bounds room
			return undefined;
		}
	}

	/**
	 * Returns the center Room.
	 * The center Room is the spawn of the level generation and typically the Room
	 * the player is placed in initially.
	 *
	 * @returns {Room} the center room of the layout
	 */
	getCenterRoom() {
		return this.getRoom(this.x_center, this.y_center);
	}

	/**
	 * Returns all game relevant rooms.
	 * Ignores rooms which are just edges for making the world cohesive.
	 */
	getRooms() {
		return this._roomList;
	}

	/**
	 * Safely tries to retreive a valid room inside the inner-bounds.
	 * Out of bounds coordinates result in 'undefined'.
	 * @param {int} x
	 * @param {int} y
	 */
	getValidRoom(x, y) {
		if (x >= 0 && x < this.mapRoomColumns &&
			y >= 0 && y < this.mapRoomRows) {
			return this.getRoom(x, y);
		} else {
			// out of "valid bounds"
			return undefined;
		}
	}

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

					// TODO: Connect rooms together in all 8 directions

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
			log("Room layout generated.", "RoomLayoutGenerator");
		}
	}
}

export default RoomLayoutGenerator;