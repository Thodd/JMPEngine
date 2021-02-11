// engine imports
import Helper from "../../../../../src/utils/Helper.js";
import RNG from "../../../../../src/utils/RNG.js";

// game imports
import Constants from "../../Constants.js";
import M4th from "../../utils/M4th.js";
import Enemy from "./Enemy.js";

const WOLF_CONFIG = {
	// IV Frames
	hurting: {
		duration: 30
	},
	stats: {
		hp_max: 2,
		hp: 2,
		dmg: 1.5
	}
};
class Wolf extends Enemy {
	constructor(x, y) {
		super(x, y, WOLF_CONFIG);

		this.configSprite({
			sheet: "enemies",
			offset: {
				x: -8,
				y: -8
			},
			animations: {
				default: "idle_west",
				"move_north": {
					frames: [0, 1],
					dt: 10
				},
				"idle_north": {
					frames: [0, 2],
					dt: 30
				},
				"move_east": {
					frames: [3, 4],
					dt: 10
				},
				"idle_east": {
					frames: [3, 5],
					dt: 30
				},
				"move_south": {
					frames: [3, 4],
					dt: 10
				},
				"idle_south": {
					frames: [3, 5],
					dt: 30
				},
				"move_west": {
					frames: [0, 1],
					dt: 10
				},
				"idle_west": {
					frames: [0, 2],
					dt: 30
				}
			}
		});

		this.AI = {
			behavior: "move",
			spawn: {
				x: x,
				y: y
			},
			movementDir: Constants.Directions.S,
			spriteDir: "west",
			steps: {
				movementTime: 4 * Constants.TILE_WIDTH,
				current: 4 * Constants.TILE_WIDTH
			},
			maxDistanceToSpawn: 5 * Constants.TILE_WIDTH,
		}
	}

	update() {
		super.update();

		if (this.AI.steps.current > 0) {
			this.AI.steps.current--;

			if (this.AI.behavior === "move") {
				let xx = this.x + this.AI.movementDir.x;
				let yy = this.y + this.AI.movementDir.y;
				let moved = false;

				// only move if we are less than 5 tiles away from the spawn
				if (M4th.inRange(xx, yy, this.AI.spawn.x, this.AI.spawn.y, this.AI.maxDistanceToSpawn)) {
						// check for collision before move
					let tm = this.getTilemap();
					if (!this.collidesWith(tm, xx, yy)) {
						this.x = xx;
						this.y = yy;
						moved = true;
					}
				}

				if (!moved) {
					this.AI.behavior = "idle";
				}
			}

			// animation is composed of the {behaviorName}_{directionName}
			this.playAnimation({name: `${this.AI.behavior}_${this.AI.movementDir.name}`});
		} else {
			this.AI.steps.current = this.AI.steps.movementTime;

			// 25% of the time we just stand around idling
			if (RNG.random() < 0.25) {
				this.AI.behavior = "idle";
			} else {
				this.AI.behavior = "move";
				// choose a non-blocking random cardinal direction to move
				let freeDirections = Constants.Directions.CARDINAL.filter((dir) => {
					return !this.collidesWith(this.getTilemap(), this.x + dir.x, this.y + dir.y);
				});
				this.AI.movementDir = Helper.choose(freeDirections);
			}

		}
	}
}

export default Wolf;