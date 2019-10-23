import { log, warn, fail } from "../utils/Log.js";
import Spritesheets from "./Spritesheets.js";

let _mManifest = null;

class Grid {
	constructor(mOptions) {
		this.id = mOptions.id;

		this.w = mOptions.w;
		this.h = mOptions.h;
		this.sheet = _mManifest.spritesheets[mOptions.sheet];

		if (!this.sheet) {
			fail(`Spritesheet not found ${mOptions.sheet}!`);
		}

		this.data = [];

		// canvas is created but not yet initialized
		this.canvas = document.createElement("canvas");
		this.ctx = this.canvas.getContext("2d");

		// set width and height of the rendering canvas
		this.canvas.width = this.sheet.w * this.w;
		this.canvas.height = this.sheet.h * this.h;
	}
}

/**
 * Gets the tile at (x, y).
 * Makes sure the Grid is correctly initialized at the given coordinates (default: -1).
 * Sets the given coordinates to the default if not set yet.
 * For performance/memory reasons, the Grid is not completly filled with the empty
 * default tile upon creation.
 */
function _get(id, x, y) {
	var grid = _mManifest.maps[id];
	// missing grid
	if (!grid) {
		fail(`Grid does not exist: ${id}`, "GFX.Grid");
	}
	// (x, y) is outside the map boundaries
	if(x < 0 || x >= grid.w || y < 0 || y >= grid.h) {
		fail(`Grid coordinates are invalid: (#: ${id}, x: ${x}, y: ${y}).`, "GFX.Grid");
	}

	var aX = grid.data[x];
	if (aX == undefined) {
		grid.data[x] = [];
	}
	var aY = grid.data[x][y];
	if (aY == undefined) {
		grid.data[x][y] = -1;
	}
	return grid.data[x][y];
}

/**
 * Sets a given tile onto the Grid.
 */
function _set(id, x, y, v, color) {
	// make sure the Grid exists & the x/y coordinates are writable
	_get(id, x, y);

	// write value to grid data
	var grid = _mManifest.maps[id];
	grid.data[x][y] = v;

	_render(id, x, y, v, color);
}

/**
 * Renders the given tile to the Grid's canvas.
 * Color information is respected here, even though the tile still only has the "value" set.
 */
function _render(id, x, y, v, color) {
	var grid = _mManifest.maps[id];
	if (!grid) {
		fail(`Grid '${id}' does not exists!`, "GFX.Grid");
	}

	// always clear the tile first, so we don't get issues with transparent tiles
	grid.ctx.clearRect(x * grid.sheet.w, y * grid.sheet.h, grid.sheet.w, grid.sheet.h);

	// everything except -1 means we have a tile
	// -1 means the tile is only cleared
	if (v != -1) {
		var oTileCanvas = Spritesheets.getCanvasFromSheet(grid.sheet.name, v, color);

		grid.ctx.drawImage(oTileCanvas, x * grid.sheet.w, y * grid.sheet.h);
	}
}

let initialized = false;

function init(mani) {
	_mManifest = mani;

	// make sure we have at least an empty maps object
	_mManifest.maps = _mManifest.maps || {};

	if (initialized) {
		warn("already initialized!", "GFX.Grid");
		return;
	}

	log("Grid module initialized.", "GFX.Grid");

	initialized = true;
}

export default {

	init,

	create: function(mOptions) {
		if (_mManifest.maps[mOptions.id]) {
			fail(`A Grid with ID ${mOptions.id} already exists!`, "GFX.Grid");
		}
		_mManifest.maps[mOptions.id] = new Grid(mOptions);
	},

	/**
	 * Gets the tile at (x, y).
	 */
	get: function(id, x, y) {
		return _get(id, x, y);
	},

	/**
	 * Sets the tile at (x, y).
	 */
	set: function(id, x, y, v, color) {
		_set(id, x, y, v, color);
		return v;
	},

	clear: function(id, x, y, w, h) {
		// default: clear only one tile
		if (!w && !h) {
			_set(id, x, y, -1);
		}
	}
};