import Enemy from "./Enemy.js";

class Wolf extends Enemy {
	constructor({gameTile}) {
		super({gameTile});

		this.name = "Wolf";

		let stats = this.getStats();
		stats.hp_max = 3;
		stats.hp = 3;
		stats.speed = 80; // a wolf is a bit slower than the player, this allows the player to run away

		this.configSprite({
			sheet: "enemies",
			offset: {
				x: -1,
				y: -1
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

	/**
	 * Turn taking logic
	 * Wolf uses a very simple fuzzy "step-towards-player" logic.
	 * No as good as Djkstra or A*, but good enough to simulate animal behavior.
	 */
	takeTurn() {
		let player = this.getPlayer();

		// We are directly adjacent to the player: always attack!
		if (this.isStandingAdjacent(player)) {
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

export default Wolf;