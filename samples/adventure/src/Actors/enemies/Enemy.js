import Helper from "../../../../../src/utils/Helper.js";
import BaseActor from "../BaseActor.js";
import MovementAnimation from "../../animations/MovementAnimation.js";
import AnimationPool from "../../animations/AnimationPool.js";
import { log } from "../../../../../src/utils/Log.js";
import RNG from "../../../../../src/utils/RNG.js";

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
		// in case we have taken damage from the player since our last turn
		// we try to retaliate
		let player = this.getPlayer();
		if (this._sinceLastTurn.hasTakenDamage == player) {
			// attack player: melee
			if (this.isStandingAdjacent(player) && RNG.random() < 0.5) {
				log(`attacks the player.`, this);

				// TODO: Attack player & create animation

			} else {
				this.makeRandomMove();
			}
		} else {
			this.makeRandomMove();
		}

		this.resetSinceLastTurnInfo();
	}

	/**
	 * Makes a random move and schedules animations if needed.
	 *
	 * @param {BaseAnimation[]} anims a set of animations to which the random move should be added
	 */
	makeRandomMove() {
		let startTile = this.getTile();

		// pick random tile to move to
		let goalTile = Helper.choose(this.getAdjacentNeumannTiles().all);

		// only move if the start and goal tile are different
		// saves some Animation instances etc.
		if (goalTile && goalTile != startTile && goalTile.isFree()) {
			this.moveToTile(goalTile);
			let a = AnimationPool.get(MovementAnimation, this);
			a.moveFromTo(startTile, goalTile);
			this.scheduleAnimation(a);
		}
	}

}

export default Enemy;