import Helper from "../../../../../src/utils/Helper.js";
import BaseActor from "../BaseActor.js";
import MovementAnimation from "../../animations/MovementAnimation.js";
import AnimationPool from "../../animations/AnimationPool.js";

class Enemy extends BaseActor {
	constructor({gameTile}) {
		super({gameTile});

		this.isBlocking = true;

		this.configSprite({
			sheet: "enemies",
			offset: {
				x: -3,
				y: -7
			},
			animations: {
				default: "right",
				"left": {
					frames: [0, 1],
					dt: 40
				},
				"right": {
					frames: [2, 3],
					dt: 40
				}
			}
		});
	}

	toString() {
		return "Enemy#" + this._ID;
	}

	takeTurn() {
		let anims = [];
		let startTile = this.getTile();

		// pick random tile to move to
		let goalTile = Helper.choose(this.getAdjacentNeumannTiles().all);

		// only move if the start and goal tile are different
		// saves some Animation instances etc.
		if (goalTile && goalTile != startTile && goalTile.isFree()) {
			this.moveToTile(goalTile);
			let a = AnimationPool.get(MovementAnimation, this);
			a.moveFromTo(startTile, goalTile);
			anims.push(a);
		}

		return anims;
	}

}

export default Enemy;