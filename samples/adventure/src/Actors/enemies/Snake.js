import Enemy from "./Enemy.js";
import RNG from "../../../../../src/utils/RNG.js";

class Snake extends Enemy {
	constructor({gameTile}) {
		super({gameTile});

		this.name = "Snake";

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
	}

}

export default Snake;