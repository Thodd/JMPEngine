import BaseActor from "../BaseActor.js";

/**
 * @abstract
 */
class Enemy extends BaseActor {
	constructor({gameTile}) {
		super({gameTile});
		this.isBlocking = true;

		this.name = "Enemy#" + this._ID;
		this.nameColor = "#FF0000";
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
	}

}

export default Enemy;