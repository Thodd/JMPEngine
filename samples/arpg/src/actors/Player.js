import Keyboard from "../../../../src/input/Keyboard.js";
import Keys from "../../../../src/input/Keys.js";
//import FrameCounter from "../../../../src/utils/FrameCounter.js";

import Actor from "./Actor.js";
import SwordAttack from "./attacks/SwordAttack.js";
import TileBasedEffect from "./effects/TileBasedEffect.js";
import Constants from "../Constants.js";

class Player extends Actor {
	constructor(x, y) {
		super(x, y);

		this.layer = Constants.Layers.PLAYER;

		// we need to reduce the size of the hitbox a bit, so the player has more room for error
		this.updateHitbox({
			x: 3,
			y: 6,
			w: 10,
			h: 10
		});

		this.dir = "down";

		this.setTypes(["player"]);

		this.configSprite({
			sheet: "player",

			// the player sprites are offset by 16x16 pixels in the spritesheet
			// we need to remove the mostly transparent pixels by providing a default offset for all animations
			offset: {
				x: -16,
				y: -16
			},

			animations: {
				default: "down",

				"down": {
					frames: [0, 1, 0, 2],
					dt: 8
				},
				"idle_down": {
					frames: [0]
				},
				"slash_down": {
					frames: [12, 13, {id: 14, dt: 4}],
					dt: 1
				},

				"up": {
					frames: [3, 4, 3, 5],
					dt: 8
				},
				"idle_up": {
					frames: [3]
				},
				"slash_up": {
					frames: [15, 16, {id: 17, dt: 4}],
					dt: 1
				},

				"left": {
					frames: [6, 7],
					dt: 8
				},
				"idle_left": {
					frames: [6]
				},
				"slash_left": {
					frames: [18, 19, {id: 20, dt: 4}],
					dt: 1
				},

				"right": {
					frames: [8, 9],
					dt: 8
				},
				"idle_right": {
					frames: [8]
				},
				"slash_right": {
					frames: [21, 22, {id: 23, dt: 4}],
					dt: 1
				},
			}
		});

		// create associated entities
		// we add these as a composition of the Player class to keep the already complex
		// Player class as easy readable as possible
		this.swordAttack = new SwordAttack(this);
		this.tileBasedEffect = new TileBasedEffect(this);

		//this.blink = new FrameCounter(5);
	}

	added() {
		// once a Player instance is added we also add its associated entities like Attacks or Effects
		this.getScreen().add(this.swordAttack);
		this.getScreen().add(this.tileBasedEffect);
	}

	destroy() {
		super.destroy();
		// also clean up all associated entities
		this.swordAttack.destroy();
		this.tileBasedEffect.destroy();
	}

	update() {

		// flag might be set to true during movement checks
		let moved = false;

		// if (this.blink.isReady()) {
		// 	this.visible = false;
		// } else {
		// 	this.visible = true;
		// }

		if (this._isAttacking) {
			// do nothing
		} else {
			let dir = null;

			// attacking
			if (Keyboard.pressed(Keys.S)) {
				this._isAttacking = true;

				this.swordAttack.reset(this.dir);

				this.playAnimation({
					name: `slash_${this.dir}`,
					reset: true,
					change: () => {
						this.swordAttack.nextPosition();
					},
					done: () => {
						// make sure the sword hitbox is not active anymore
						this.swordAttack.setCollidable(false);
						// reactivate movement of player
						this._isAttacking = false;
						this.playAnimation({name: `idle_${this.dir}`});
					}
				});
			} else {
				// walking
				let dx = 0;
				let dy = 0;

				if (Keyboard.wasPressedOrIsDown(Keys.LEFT)) {
					dx--;
					dir = "left";
				} else if (Keyboard.wasPressedOrIsDown(Keys.RIGHT)) {
					dx++;
					dir = "right";
				}

				if (Keyboard.wasPressedOrIsDown(Keys.UP)) {
					dy--;
					dir = "up";
				} else if (Keyboard.wasPressedOrIsDown(Keys.DOWN)) {
					dy++;
					dir = "down";
				}

				// retrieve tilemap from the screen for collision detection
				let tm = this.getScreen().getTilemap();

				// regular movement
				if (dx != 0) {
					if (!this.collidesWith(tm, this.x + dx, this.y)) {
						this.x += dx;
						moved = true;
					}
				}
				if (dy != 0) {
					if (!this.collidesWith(tm, this.x, this.y + dy)) {
						this.y += dy;
						moved = true;
					}
				}

				// if no regular movement occured, check if we can push the player around an obstacle
				if (!moved) {
					if (dx != 0) {
						if (!this.collidesWith(tm, this.x + dx, this.y + 6)) {
							this.y += 1;
						} else if (!this.collidesWith(tm, this.x + dx, this.y - 6)) {
							this.y -= 1;
						}
					} else if (dy != 0) {
						if (!this.collidesWith(tm, this.x + 6, this.y + dy)) {
							this.x += 1;
						} else if (!this.collidesWith(tm, this.x - 6, this.y + dy)) {
							this.x -= 1;
						}
					}
				}

				// change animation
				if (dir !== null) {
					this.dir = dir;
					this.playAnimation({name: this.dir});
				} else {
					this.playAnimation({name: `idle_${this.dir}`});
				}
			}
		}

		// we update the tile-based effects last so they can be correctly positioned after the player moved
		this.checkForTileBasedEffect(moved);
	}

	/**
	 * Whenever the player is on a tile with an effect, e.g. Grass we have to trigger it.
	 */
	checkForTileBasedEffect(playerMoved) {
		let tile = this.getClosestTile();
		this.tileBasedEffect.check(tile, playerMoved);
	}

}

export default Player;