import { assert, warn } from "../../../../../../src/utils/Log.js";
import { random, randomInteger } from "../../../../../../src/utils/RNG.js";

import RLCell from "../../../core/RLCell.js";
import TileTypes from "./TileTypes.js";

class Tile extends RLCell {
	constructor(map, x, y) {
		super(map, x, y);

		this._type = TileTypes.VOID;
	}

	/**
	 * Changes the TileType of the tile.
	 * Affects visuals and Gameplay behavior e.g. blocking tiles.
	 *
	 * @param {TileType} type the type to set
	 */
	setType(type) {
		if (type) {
			this._type = type;

			// track whether the tile type is blocking light, used for FOV calculation
			this.blocksLight = type.blocksLight || false;

			this._changeVisuals(type);
		} else {
			this._type = TileTypes.VOID;
			warn("No tile type given. Defaulting to VOID.", "Tile");
		}
	}

	/**
	 * Returns the currently set TileType.
	 * @returns {TileType} the currently set TileType
	 */
	getType() {
		return this._type;
	}

	/**
	 * Changes the RLCell rendering-info to the TileTypes visual definition.
	 * Takes care of variant handling.
	 *
	 * @param {TileType} type the tile type for which the visuals should be changed
	 */
	_changeVisuals(type) {
		let visuals = type.visuals;
		let renderInfo = visuals;

		if (visuals.variants) {
			// sanity checks
			// TODO: move to a separate check module, which can be executed without starting the game
			assert(visuals.variants.length > 1, `Only one variant for type ${type.name} defined!`, "TileType Sanity Check");
			assert(visuals.probability != null, `No probability defined for type ${type.name}!`, "TileType Sanity Check");

			// make a random roll to see if we deviate from the default variant
			renderInfo = visuals.variants[0];
			if (random() < visuals.probability) {
				// we deviate, so we choose any other variant except the first one
				renderInfo = visuals.variants[randomInteger(1, visuals.variants.length-1)];
			}
		}

		// change rendering info, automatically dirties the RLCell & the RLMap
		this.id = renderInfo.id;
		this.color = renderInfo.color;
		this.background = renderInfo.background || 0x000000;
	}

	isFree() {
		let isWalkable = this._type.isWalkable;

		// in principle the tile is free, we now check if an actor is blocking it
		if (isWalkable) {
			let actors = this.getActors();
			for (let i = 0; i < actors.length; i++) {
				if (!actors[i].isWalkable) {
					isWalkable = false;
					break;
				}
			}
		}

		return isWalkable;
	}
}

export default Tile;