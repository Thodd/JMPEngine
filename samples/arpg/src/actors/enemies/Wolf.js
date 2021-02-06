// engine imports
import Helper from "../../../../../src/utils/Helper.js";

// game imports
import Constants from "../../Constants.js";
import AITools from "./AITools.js";
import Enemy from "./Enemy.js";

class Wolf extends Enemy {
	constructor(x, y) {
		super(x, y);

		this.configSprite({
			sheet: "enemies",
			offset: {
				x: -8,
				y: -8
			},
			animations: {
				default: "west",
				"west": {
					frames: [0, 1],
					dt: 30
				},
				"east": {
					frames: [2, 3],
					dt: 30
				}
			}
		});

		this.AI = {
			spawn: {
				x: x,
				y: y
			},
			currentDir: Constants.Directions.S,
			steps: {
				start: 4 * Constants.TILE_WIDTH,
				current: 4 * Constants.TILE_WIDTH
			},
			maxDistanceToSpawn: 5 * Constants.TILE_WIDTH,
		}
	}

	update() {
		if (this.AI.steps.current > 0) {
			let xx = this.x + this.AI.currentDir.x;
			let yy = this.y + this.AI.currentDir.y;

			if (xx < this.x) {
				this.playAnimation({name: "west"});
			} else {
				this.playAnimation({name: "east"});
			}

			// only move if we are less than 5 tiles away from the spawn
			if (AITools.inRange(xx, yy, this.AI.spawn.x, this.AI.spawn.y, this.AI.maxDistanceToSpawn)) {
					// check for collision before move
				let tm = this.getTilemap();
				if (!this.collidesWith(tm, xx, yy)) {
					this.x = xx;
					this.y = yy;
				}
			}

			this.AI.steps.current--;
		} else {
			this.AI.steps.current = this.AI.steps.start;
			this.AI.currentDir = Helper.choose(Constants.Directions.CARDINAL);
		}
	}
}

export default Wolf;