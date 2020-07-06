import Entity from "../../../../src/game/Entity.js";
import Keyboard from "../../../../src/input/Keyboard.js";
import Keys from "../../../../src/input/Keys.js";
import SwordAttack from "./attacks/SwordAttack.js";

class Player extends Entity {
	constructor(x, y) {
		super(x, y);

		this.updateHitbox({
			x: 3,
			y: 6,
			w: 10,
			h: 10
		});

		this.configSprite({
			sheet: "player",

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
					frames: [12, 13, {id: 14, dt: 3}],
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
					frames: [15, 16, {id: 17, dt: 3}],
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
					frames: [18, 19, {id: 20, dt: 3}],
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
					frames: [21, 22, {id: 23, dt: 3}],
					dt: 1
				},
			}
		});

		this.dir = "down";

		this.swordAttack = new SwordAttack(this);

		//this.blink = new FrameCounter(3);
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
		// if (this.blink.isReady()) {
		// 	this.visible = false;
		// } else {
		// 	this.visible = true;
		// }

		if (this._isAttacking) {
			return;
		}

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

		this.getScreen().centerCameraAround(this);
	}

}

export default Player;