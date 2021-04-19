import Constants from "../../Constants.js";
import Enemy from "./Enemy.js";
import ItemTypes from "../../items/ItemTypes.js";

class Bear extends Enemy {
	constructor({gameTile}) {
		super({gameTile});

		this.name = "Bear";

		let stats = this.getStats();
		stats.hp_max = 12;
		stats.hp = 12;
		stats.speed = 60; // Bears are slow

		this.configSprite({
			sheet: "enemies",
			offset: {
				x: -1,
				y: -1
			},
			animations: {
				default: "right",
				"left": {
					frames: [4, 5],
					dt: 40
				},
				"right": {
					frames: [6, 7],
					dt: 40
				}
			}
		});
	}

	equipInitialWeapon() {
		// equip default weapon
		let weapon = ItemTypes.CLAWS;
		this.getBackpack().addItem(weapon);
		this.getBackpack().equipItem(weapon, Constants.EquipmentSlots.MELEE);
	}

	/**
	 * Turn taking logic
	 * Bears use the same fuzzy "step-towards-player" logic like wolves.
	 */
	takeTurn() {
		let player = this.getPlayer();

		// We are directly adjacent to the player: always attack!
		// also attack diagonally!
		if (this.isStandingAdjacent(player, true)) {
			this.meleeAttackActor(player);
		} else {
			// if player is not adjacent but close: move towards player
			if (this.manhattanDistanceTo(player) < 8) {
				this.moveTowardsActor(player);
			} else {
				// do nothing... wait for the player to come closer
			}
		}
	}
}

export default Bear;