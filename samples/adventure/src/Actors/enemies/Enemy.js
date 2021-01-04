import Constants from "../../Constants.js";

import BaseActor from "../BaseActor.js";

import ItemTypes from "../../items/ItemTypes.js";

/**
 * @abstract
 */
class Enemy extends BaseActor {
	constructor({gameTile}) {
		super({gameTile});
		this.isBlocking = true;

		this.name = "Enemy#" + this._ID;
		this.nameColor = "#be2632";

		this.equipInitialWeapon();
	}

	equipInitialWeapon() {
		// equip default weapon
		let weapon = ItemTypes.FANGS;
		this.getBackpack().addItem(weapon);
		this.getBackpack().equipItem(weapon, Constants.EquipmentSlots.MELEE);
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

	afterDeath() {
		// enemies can drop standard loot
		this.gameTile.dropStandardLoot();
	}

}

export default Enemy;