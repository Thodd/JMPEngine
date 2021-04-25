import Constants from "../../Constants.js";
import Entity from "../../../../../src/game/Entity.js";
import EffectPool from "./EffectPool.js";

class BaseEffect extends Entity {
	constructor() {
		super();
		this.layer = Constants.Layers.BELOW_ACTORS;

		// just a graphics effect, no logic update needed
		this.active = false;
	}
	setTile(gameTile) {
		this.gameTile = gameTile;
		this.x = gameTile.x * Constants.TILE_WIDTH;
		this.y = gameTile.y * Constants.TILE_HEIGHT;
	}
	reset() {
	}
	done() {
		EffectPool.release(this);
	}
}

export default BaseEffect;