import Entity from "../../../../src/game/Entity.js";
import Keyboard from "../../../../src/input/Keyboard.js";
import Keys from "../../../../src/input/Keys.js";

Entity.RENDER_HITBOXES = "#FF0085";

class Player extends Entity {
	constructor({x, y}) {
		super({x, y});

		this.setSprite({
			sheet: "chars",

			offsetY: 0,

			animations: {
				default: "down",

				"down": {
					frames: [0, 1, 0, 2],
					delay: 8
				},
				"idle_down": {
					frames: [0]
				},

				"up": {
					frames: [3, 4, 3, 5],
					delay: 8
				},
				"idle_up": {
					frames: [3]
				},

				"left": {
					frames: [6, 7],
					delay: 8
				},
				"idle_left": {
					frames: [6]
				},

				"right": {
					frames: [8, 9],
					delay: 8
				},
				"idle_right": {
					frames: [8]
				},
			}
		});

		this.dir = "down";

		this.hitbox.w = 16;
		this.hitbox.h = 16;
	}

	update() {
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
	}
}

export default Player;