import Tile from "../../../../src/game/Tile.js";

class GameTile extends Tile {

	constructor({tilemap, x, y}) {
		super({tilemap, x, y});

		this._actors = new Set();
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
}

export default GameTile;