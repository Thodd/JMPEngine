import Enemy from "./Enemy.js";
import RNG from "../../../../../src/utils/RNG.js";

class Wolf extends Enemy {
	constructor({gameTile}) {
		super({gameTile});

		this.name = "Wolf";

		this._stats.hp_max = 5;
		this._stats.hp = 5;
		this._stats.atk = 2;
		this._stats.def = 2;
		this._stats.speed = 80; // a wolf is a bit slower than the player, this allows the player to run away

		this.configSprite({
			sheet: "enemies",
			offset: {
				x: -3,
				y: -7
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

	/**
	 * Turn taking logic
	 */
	takeTurn() {
		let player = this.getPlayer();

		// We are directly adjacent to the player: always attack!
		if (this.isStandingAdjacent(player)) {
			this.meleeAttackActor(player);
		} else {
			// if player is not adjacent but close: move towards player
			if (this.manhattanDistanceTo(player) < 6) {
				let tm = this.getTilemap();
				let xDif = -1 * Math.sign(this.gameTile.x - player.gameTile.x);
				let yDif = -1 * Math.sign(this.gameTile.y - player.gameTile.y);
				let goalTile = null;

				// first check if we can move horizontally
				if (xDif != 0) {
					goalTile = tm.get(this.gameTile.x + xDif, this.gameTile.y);
					if (goalTile && goalTile.isFree()) {
						this.moveToTile(goalTile);
					} else {
						goalTile = null;
					}
				}

				// if horizontyl move was impossible  -> try vertically
				if (!goalTile) {
					if (yDif != 0) {
						goalTile = tm.get(this.gameTile.x, this.gameTile.y + yDif);
						if (goalTile && goalTile.isFree()) {
							this.moveToTile(goalTile);
						} else {
							goalTile = null;
						}
					}
				}
			} else {
				// do nothing... wait for the player to come closer
			}
		}
	}

}

export default Wolf;