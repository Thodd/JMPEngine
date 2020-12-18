import Tile from "../../../../src/game/Tile.js";
import Helper from "../../../../src/utils/Helper.js";
import RNG from "../../../../src/utils/RNG.js";

const Types = {
	EMPTY: {
		id: 0,
		walkable: true
	},
	VOID: {
		id: 1,
		walkable: true
	},
	FLOOR: {
		id: [2, 3, 4, 5, 6],
		probability: 0.1,
		walkable: true
	},
	DIRT: {
		id: 4,
		walkable: true
	},
	GRASS: {
		id: 5,
		walkable: true
	},
	TREE: {
		id: [64, 66],
		probability: 0.5,
		walkable: false
	},
	SIGN: {
		id: 67,
		walkable: false
	},
	WALL: {
		id: [40, 41],
		probability: 0.1,
		walkable: false
	}
};



class GameTile extends Tile {

	constructor({tilemap, x, y}) {
		super({tilemap, x, y});

		// Movable actors, e.g. Player, Enemies, Pick-ups, Items, ...
		this._actors = [];

		// TODO: track the visual effects e.g. blood or butterflies
		// this._effects = [];

		this.setType(Types.VOID);
	}

	addActor(a) {
		this._actors.push(a);
		return a;
	}

	removeActor(a) {
		let i = this._actors.indexOf(a);
		if (i >= 0) {
			this._actors.splice(i, 1);
		}
		return a;
	}

	getActors() {
		return this._actors;
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

	/**
	 * Changes the type of this GameTile instance.
	 * Updates the visuals and the gameplay properties like "walkable" etc.
	 * @param {GameTile.Types} type the new type to set for this tile instance
	 */
	setType(type) {
		this._type = type;

		// set visuals (not used right now)
		// this.color = this._type.color;

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