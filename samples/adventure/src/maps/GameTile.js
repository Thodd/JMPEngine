import Tile from "../../../../src/game/Tile.js";
import Helper from "../../../../src/utils/Helper.js";
import RNG from "../../../../src/utils/RNG.js";
import Constants from "../Constants.js";

const Types = {
	VOID: {
		id: 0,
		color: Constants.Colors.BLUE_LIGHT,
		walkable: true
	},
	EMPTY: {
		id: 1,
		color: undefined, // no tinting for empty tile
		walkable: true
	},
	FLOOR: {
		id: [1, 2, 3],
		probability: 0.1,
		color: Constants.Colors.GREEN_LIGHT,
		walkable: true
	},
	DIRT: {
		id: 4,
		color: Constants.Colors.BROWN_DARK,
		walkable: true
	},
	GRASS: {
		id: 5,
		color: Constants.Colors.GREEN_LIGHT,
		walkable: true
	},
	TREE: {
		id: [6, 7],
		probability: 0.5,
		color: Constants.Colors.GREEN_LIGHT,
		walkable: false
	},
	WALL: {
		id: [40, 41],
		probability: 0.1,
		color: Constants.Colors.WHITE,
		walkable: false
	}
};



class GameTile extends Tile {

	constructor({tilemap, x, y}) {
		super({tilemap, x, y});

		this._actors = new Set();

		this.setType(Types.VOID);
	}

	addActor(a) {
		this._actors.add(a);
	}

	removeActor(a) {
		this._actors.delete(a);
	}

	getAllActors() {
		return [...this._actors];
	}

	/**
	 * Check if the Tile is free to walk on.
	 * Depends on the type of actors, which are currently on the tile.
	 *
	 * Since a roguelike does not use a hitbox based tilemap collision,
	 * we don't use the isBlocking flag of the Tile class, but the game specific tile type.
	 */
	isFree() {
		// first check, is the tile walkable -> if not, that obviously means the tile is not free
		let isFree = this._type.walkable;
		if (isFree) {
			// now check the actor stack
			// there might be some actors, like pickups, health potions etc which are not blocking another Actor from moving here
			for (let a of this._actors) {
					isFree = isFree && !a.isBlocking;
			}
		}
		return isFree;
	}

	setType(type) {
		this._type = type;

		// set visuals
		this.tint = this._type.color;

		// set id
		let newId = this._type.id;
		if (Array.isArray(this._type.id)) {
			let defaultId = this._type.id[0];
			// change ID based ob the given probability
			let prob = this._type.probability || 1;
			if (RNG.random() < prob) {
				newId = Helper.choose(this._type.id.slice(1));
			} else {
				newId = defaultId;
			}
		}
		this.set(newId);
	}
}

GameTile.Types = Types;

export default GameTile;