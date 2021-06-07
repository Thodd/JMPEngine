import Algorithms from "../utils/Algorithms.js";

/**
 * Simple brute force FOV implemetation based on Bresenham's line algorithm.
 */
class FOV {
	constructor(map) {
		this._map = map;

		this._defaultClampValues = {
			x_min: 0,
			y_min: 0,
			x_max: this._map.width,
			y_max: this._map.height
		};

		this._isActive = true;

		// the list of all currently lit cells
		this._currentlyLitCells = [];
	}

	update(centerCell, radius, clampValues) {
		if (this._isActive) {

			clampValues = clampValues || this._defaultClampValues;

			// place the currently lit cells into shadow
			this._currentlyLitCells.forEach((cell) => {
				// only place dynamically lit cells in shadow
				// cells that are always lit (e.g. a lamp's light cone) are not affected by dynamic lighting
				if (cell.lightLevel != FOV.LightLevels.ALWAYS) {
					cell.lightLevel = FOV.LightLevels.SHADOW;
				}
			});
			this._currentlyLitCells = [];

			let cx = centerCell.x;
			let cy = centerCell.y;

			// clamp the max/min x/y coordinates based on the given values (defaults to the map width/height)
			let x_min = Math.max(clampValues.x_min, cx - radius);
			let y_min = Math.max(clampValues.y_min, cy - radius);
			let x_max = Math.min(clampValues.x_max, cx + radius);
			let y_max = Math.min(clampValues.y_max, cy + radius);

			// cast a set of rays to light all cells in a certain radius around the center point
			for (let x = x_min; x < x_max; x++) {
				for (let y = y_min; y < y_max; y++) {
					let lineOfSight = Algorithms.bresenham(cx, cy, x, y);

					for (let i = 0; i < lineOfSight.length; i++) {
						let p = lineOfSight[i];
						let tile = this._map.get(p.x, p.y);
						if (tile) {
							if (tile.lightLevel != FOV.LightLevels.ALWAYS) {
								tile.lightLevel = FOV.LightLevels.LIT;
								this._currentlyLitCells.push(tile);
							}
							// if the tile is blocking the light, we stop the processing of the other potential points
							// in the line-of-sight
							if (tile.blocksLight) {
								break;
							}
						} else {
							break;
						}
					}
				}
			}
		}
	}
}

/**
 * All possible light levels.
 * - DARKNESS: nothing is rendered,
 * - SHADOW: monochrome colored
 * - LIT: standard rendering of a cell
 * - ALWAYS: same as lit, cannot be set to shadow or darkness
 */
FOV.LightLevels = {
	"DARKNESS": 0,
	"SHADOW": 1,
	"LIT": 2,
	"ALWAYS": 3
};

/**
 * Defines the color values for the different light levels.
 */
FOV.Colors = {
	"DARKNESS": {
		color: 0,
		background: undefined
	},
	"SHADOW": {
		color: 0x293531,
		background: 0x19211e
		// color: 0x394b45,
		// background: 0x232d2a
		// color: 0x170b5b,
		// background: 0x1c115a
	}
}

export default FOV;