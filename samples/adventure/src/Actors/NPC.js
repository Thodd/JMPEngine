import BaseActor from "./BaseActor.js";
import MovementAnimation from "../animations/MovementAnimation.js";
import AnimationPool from "../animations/AnimationPool.js";

class NPC extends BaseActor {
	constructor({gameTile}) {
		super({gameTile});

		this.isBlocking = true;

		this.configSprite({
			sheet: "enemies",
			offset: {
				x: 0,
				y: 0
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

		// debugging for sprite positioning
		this.RENDER_HITBOX = 0xFF0085;
		this.updateHitbox({
			x: 0, y:0, w:16, h:16
		});
	}

	takeTurn() {
		let anims = [];
		let startTile = this.getTile();

		// pick random tile to move to
		let goalTile = this.getRandomAdjacentTile();

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

export default NPC;