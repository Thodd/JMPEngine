import FOV from "./controller/FOV.js";

/**
 * Maps directions to relative coordinates.
 */
const _adjacentMapping = {
	"N":  {x:  0, y: -1},
	"NE": {x:  1, y: -1},
	"E":  {x:  1, y:  0},
	"SE": {x:  1, y:  1},
	"S":  {x:  0, y:  1},
	"SW": {x: -1, y:  1},
	"W":  {x: -1, y:  0},
	"NW": {x: -1, y: -1},
};

/**
 * Base class for RLCells.
 */
class RLCell {
	constructor(map, x, y) {
		this._map = map;
		this.x = x;
		this.y = y;

		this._actors = [];

		this._mooreCells = null;
		this._neumannCells = null;

		this._renderInfo = {
			id: 0,
			color: 0xFFFFFF,
			background: undefined,
			lightLevel: FOV.LightLevels.DARKNESS,
			blocksLight: false,
		};
	}

	/**
	 * Returns the RLMap to which this RLCell belongs.
	 * @returns {RLMap}
	 * @public
	 */
	getMap() {
		return this._map;
	}

	/**
	 * Marks the RLCell as dirty.
	 * Extends to the containing RLMap.
	 * @public
	 */
	dirty() {
		this._map.dirty();
	}

	set id(v) {
		this.dirty();
		this._renderInfo.id = v;
	}

	get id() {
		return this._renderInfo.id;
	}

	set color(v) {
		this.dirty();
		this._renderInfo.color = v;
	}

	get color() {
		return this._renderInfo.color;
	}

	set background(v) {
		this.dirty();
		this._renderInfo.background = v;
	}

	get background() {
		return this._renderInfo.background;
	}

	set blocksLight(v) {
		this.dirty();
		this._renderInfo.blocksLight = v;
	}

	get blocksLight() {
		return this._renderInfo.blocksLight;
	}

	set lightLevel(v) {
		this.dirty();
		this._renderInfo.lightLevel = v;
	}

	get lightLevel() {
		return this._renderInfo.lightLevel;
	}

	/**
	 * Retrieves the RLActor on top of the actor list.
	 * @returns {RLActor}
	 * @public
	 */
	getTopActor() {
		return this._actors[this._actors.length - 1];
	}

	/**
	 * Retrieves the first actor in the list that is visible.
	 * Important for correctly rendering a cell.
	 * Invisible RLActors should not hide any actually visible actors.
	 * @returns {RLActor}
	 * @public
	 */
	getTopVisibleActor() {
		for (let i = this._actors.length-1; i >= 0; i--) {
			if (this._actors[i].visible) {
				return this._actors[i];
			}
		}
	}

	/**
	 * Retrieves the full list of all actors.
	 * Can be sorted if needed. Sorting changes the result of getTopActor().
	 * @returns {RLActor[]}
	 * @public
	 */
	getActors() {
		return this._actors;
	}

	/**
	 * Adds the given RLActor to the cell.
	 * @param {RLActor} a the actor to add
	 * @public
	 */
	addActor(a) {
		// only add actors which are not added to a cell already
		if (!a._cell) {
			this._actors.push(a);
			a._cell = this;
			this.dirty();
		}
	}

	/**
	 * Removes the given RLActor from the cell.
	 * @param {RLActor} a the actor to remove
	 */
	removeActor(a) {
		if (a._cell == this) {
			let i = this._actors.indexOf(a);
			this._actors.splice(i, 1);
			a._cell = null;
			this.dirty();
		}
	}

	/**
	 * Returns whether an RLCell is free for an RLActor to move to.
	 * Important: Should be overwritten in subclasses with game logic!
	 * Base implementation always returns true!
	 *
	 * @returns {boolean} whether the cell is considered free
	 */
	isFree() {
		return true;
	}

	/**
	 * Internal function to cache the map of all adjacent cells.
	 */
	_initNeighborCells() {
		// since the neighboring cells never can change,
		// we just cache them after first calculation
		if (this._mooreCells == null) {
			this._mooreCells = {
				"N":  this.getRelative( 0, -1),
				"NE": this.getRelative( 1, -1),
				"E":  this.getRelative( 1,  0),
				"SE": this.getRelative( 1,  1),
				"S":  this.getRelative( 0,  1),
				"SW": this.getRelative(-1,  1),
				"W":  this.getRelative(-1,  0),
				"NW": this.getRelative(-1, -1)
			};

			this._neumannCells = {
				"N": this._mooreCells["N"],
				"E": this._mooreCells["E"],
				"S": this._mooreCells["S"],
				"W": this._mooreCells["W"]
			};

			// clean undefineds (for cells on the edge of the map)
			Object.keys(this._mooreCells).forEach((dir) => {
				if (!this._mooreCells[dir]) {
					delete this._mooreCells[dir];
					delete this._neumannCells[dir];
				}
			});
		}
	}

	/**
	 * Safely retrieves an RLCell relatively positioned to this instance.
	 * You can either retrieve an arbitrary cell with a given x/y delta, or any directly
	 * adjacent RLCell in the Moore neighborhood.
	 *
	 * @example
	 * this.getRelative("W"); // returns the RLCell to the west
	 * this.getRelative("NE"); // returns the RLCell to the north-east
	 * this.getRelative(0, 1); // returns the RLCell to the south (x:0, y:+1)
	 * this.getRelative(-1, 1); // returns the RLCell to the south-west (x:-1, y:+1)
	 * this.getRelative(-3, 5); // returns the RLCell 3 cells to the left and 5 cells down (if inside the boundaries of the map of course)
	 *
	 * @param {int|string} x either a direction string ("N", "NE", "E", ...) or an x-delta of 0, 1 or -1
	 * @param {int} [y] y-delta: 0, 1 or -1, optional if string argument is given
	 * @returns {RLCell|undefined} the adjacent RLCell or <code>undefined</code> if no RLCell is present at the given coordinates
	 * @public
	 */
	getRelative(x, y) {
		let coords;
		if (typeof x === "string") {
			coords = _adjacentMapping[x];
		} else {
			coords = {x: x, y: y};
		}

		return this._map.get(this.x + coords.x, this.y + coords.y);
	}

	/**
	 * Retrieves all adjacent cells in the Neumann neighborhood.
	 * The Neumann neighborhood is the set of the 4 directly adjacent cells
	 * in the 4 cardinal.
	 *
	 * You can give a directional string as the first argument, see:
	 *     N
	 *     |
	 * W - * - E
	 *     |
	 *     S
	 *
	 * @eturns {object<RLCell>} a map of all adjacent cells in the Neumann neighborhood
	 * @public
	 */
	getNeumannNeighborCells() {
		if (!this._mooreCells) {
			this._initNeighborCells();
		}

		// we return a copy of our neighbor list, so it does not get accidentally modified
		// some directions might be empty!
		return Object.assign({}, this._neumannCells);
	}

	/**
	 * Retrieves all adjacent cells in the Moore neighborhood.
	 * The Moore neighborhood is the set of the 8 directly surrounding cells:
	 * all 4 cardinal and all 4 diagonal directions.
	 *
	 * You can give a directional string as the first argument, see:
	 * NW  N  NE
	 *   \ | /
	 * W - * - E
	 *   / | \
	 * SW  S  SE
	 *
	 * @eturns {object<RLCell>} a map of all adjacent cells in the Moore neighborhood
	 * @public
	 */
	getMooreNeighborCells() {
		if (!this._mooreCells) {
			this._initNeighborCells();
		}

		// we return a copy of our neighbor list, so it does not get accidentally modified
		// some directions might be empty!
		return Object.assign({}, this._mooreCells);
	}
}

export default RLCell;