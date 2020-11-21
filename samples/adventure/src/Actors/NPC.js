import Helper from "../../../../src/utils/Helper.js";
import BaseActor from "./BaseActor.js";
import MovementAnimation from "../animations/MovementAnimation.js";
import AnimationPool from "../animations/AnimationPool.js";

class NPC extends BaseActor {
	constructor({gameTile}) {
		super({gameTile});

		this.configSprite({
			sheet: "enemies",
			offset: {
				x: -4,
				y: -9
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

	takeTurn() {
		let anims = [];
		let startTile = this.getTile();

		// pick random tile to move to
		let newTile = this.getRandomAdjacentTile();

		if (newTile) {
			this.moveToTile(newTile);
			let a = AnimationPool.get(MovementAnimation, this);
			a.moveFromTo(startTile, newTile);
			anims.push(a);
		}

		return anims;
	}

	getRandomAdjacentTile() {
		let xx = Helper.choose([-1,0,1]);
		let yy = Helper.choose([-1,0,1]);

		return this.getTilemap().get(this.gameTile.x + xx, this.gameTile.y + yy);
	}
}

export default NPC;