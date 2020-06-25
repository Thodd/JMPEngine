import Entity from "../../../../src/game/Entity.js";
import Keyboard from "../../../../src/input/Keyboard.js";
import Keys from "../../../../src/input/Keys.js";
import SwordAttack from "./attacks/SwordAttack.js";

//Entity.RENDER_HITBOXES = "#FF0085";

class Player extends Entity {
	constructor({x, y}) {
		super({x, y});

		//this.RENDER_HITBOXES = "#FFFFFF33";

		this.hitbox.w = 16;
		this.hitbox.h = 16;

		this.setSprite({
			sheet: "player",

			offsetX: -16,
			offsetY: -16,

			animations: {
				default: "down",

				"down": {
					frames: [0, 1, 0, 2],
					delay: 8
				},
				"idle_down": {
					frames: [0]
				},
				"slash_down": {
					frames: [12, 13, 14, 14, 14],
					delay: 1
				},

				"up": {
					frames: [3, 4, 3, 5],
					delay: 8
				},
				"idle_up": {
					frames: [3]
				},
				"slash_up": {
					frames: [15, 16, 17, 17, 17],
					delay: 1
				},

				"left": {
					frames: [6, 7],
					delay: 8
				},
				"idle_left": {
					frames: [6]
				},
				"slash_left": {
					frames: [18, 19, 20, 20, 20],
					delay: 1
				},

				"right": {
					frames: [8, 9],
					delay: 8
				},
				"idle_right": {
					frames: [8]
				},
				"slash_right": {
					frames: [21, 22, 23, 23, 23],
					delay: 1
				},
			}
		});

		this.dir = "down";

		this.swordAttack = new SwordAttack(this);
	}

	added() {
		this.getScreen().add(this.swordAttack);
	}

	destroy() {
		super.destroy();
		// also clean up the sword attack
		this.swordAttack.destroy();
	}

	update() {
		if (this._isAttacking) {
			return;
		}

		// attacking
		if (Keyboard.pressed(Keys.S)) {
			this._isAttacking = true;
			this.playAnimation({
				name: `slash_${this.dir}`,
				reset: true,
				done: () => {
					this._isAttacking = false;
					this.playAnimation({name: `idle_${this.dir}`});
				}
			});
			return;
		}

		// walking
		let dx = 0;
		let dy = 0;
		let dir = null;

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

		if (dx != 0) {
			this.x += dx;
		}
		if (dy != 0) {
			this.y += dy;
		}

		if (dir !== null) {
			this.dir = dir;
			this.playAnimation({name: this.dir});
		} else {
			this.playAnimation({name: `idle_${this.dir}`});
		}

		this.getScreen().cam.x = this.x - (160/2);
		this.getScreen().cam.y = this.y - (144/2);
	}
}

export default Player;