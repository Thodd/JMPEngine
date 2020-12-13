import BaseActor from "../BaseActor.js";
//import RNG from "../../../../../src/utils/RNG.js";

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

	/**
	 * Turn taking logic
	 */
	takeTurn() {

		let player = this.getPlayer();

		// wander around and attack the player if they come to close
		if (this.isStandingAdjacent(player)) {
			this.meleeAttackActor(player);
		} else {
			this.makeRandomMove();
		}

		// in case we have taken damage from the player since our last turn
		// we try to retaliate
		// if (this._sinceLastTurn.hasTakenDamage == player) {
		// 	// attack player: melee
		// 	if (this.isStandingAdjacent(player) && RNG.random() < 1) {
		// 		this.meleeAttackActor(player);
		// 	} else {
		// 		this.makeRandomMove();
		// 	}
		// } else {
		// 	this.makeRandomMove();
		// }

		this.resetSinceLastTurnInfo();
	}

}

export default Enemy;