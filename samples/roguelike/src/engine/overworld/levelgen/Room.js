import { warn } from "../../../../../../../src/utils/Log.js";
import Constants from "../../Constants.js";

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
	constructor(rlMap, x, y) {
		this.rlMap = rlMap;
		this.x = x;
		this.y = y;
		this.isFilled = false;

		// list of all actors in this room
		// used to (de-)activate actors during room switches
		this.actors = [];

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

		// enrich Rooms with actual tile-coordinate information for scrolling
		this.dimensions = {
			x_min: this.x * Constants.VIEWPORT_WIDTH,
			y_min: this.y * Constants.VIEWPORT_HEIGHT,
		};
		// important: -1 because we the tile's are counted starting from 0
		this.dimensions.x_max = this.dimensions.x_min + Constants.VIEWPORT_WIDTH - 1;
		this.dimensions.y_max = this.dimensions.y_min + Constants.VIEWPORT_HEIGHT - 1;
	}

	getMap() {
		return this.rlMap;
	}

	addActor(a) {
		this.actors.push(a);
	}

	removeActor(a) {
		let i = this.actors.indexOf(a);
		if (i != -1) {
			this.actors.splice(i, 1);
		}
	}

	/**
	 * Iterates over all RLCells inside the Room.
	 * @param {funciton} fn callback for all RLCells in the room
	 */
	each(fn) {
		// TODO: implement
		fn();
	}

	/**
	 * Safely retrieves an adjacent Room to this instance.
	 * Only Rooms in the Moore neighborhood can be retrieved this way.
	 * The Moore neighborhood is the set of directly surounding cells,
	 * all 4 cardinal and all 4 diagonal directions.
	 *
	 * NW  N  NE
	 *   \ | /
	 * W - * - E
	 *   / | \
	 * SW  S  SE
	 *
	 * @example
	 * this.getAdjacent("W"); // returns the Room to the west
	 * this.getAdjacent("NE"); // returns the Room to the north-east
	 * this.getAdjacent(0, 1); // returns the room to the south (x:0, y:+1)
	 * this.getAdjacent(-1, 1); // returns the room to the south-west (x:-1, y:+1)
	 *
	 * @param {int|string} x either a direction string ("N", "NE", "E", ...) or an x-delta of 0, 1 or -1
	 * @param {int} [y] y-delta: 0, 1 or -1, optional if string argument is given
	 * @returns {Room|null} the adjacent room or null if no room is present at the given coordinates
	 */
	getAdjacent(x, y) {
		// access rooms directly if string is given
		if (typeof x === "string") {
			return this[x];
		}
		// map if (x, y) deltas are given
		let dir = _adjacentMapping[`${x}${y}`];
		if (dir) {
			return this[dir];
		} else {
			warn(`Cannot get adjacent Room outside the Moore neighborhood: (${x},${y}).`, "RoomLayoutGenerator.Room");
		}
	}
}

export default Room;