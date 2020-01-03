import Actor from "./Actor.js";
import Engine from "../../../../src/Engine.js";
import { log } from "../../../../src/utils/Log.js";
import Keyboard from "../../../../src/input/Keyboard.js";
import Keys from "../../../../src/input/Keys.js";
import FrameCounter from "../../../../src/utils/FrameCounter.js";


class Player extends Actor {
	constructor(x, y) {
		super(x, y);

		// collision types & hitbox
		this.setTypes(["player"]);
		this.hitbox = {
			x: 2,
			y: 2,
			w: 6,
			h: 8
		};

		// variables for input handling
		this._dirs = {
			horizontal: "right",
			vertical: ""
		};
		this._inputDelay = new FrameCounter(3);

		// gfx
		this._setupGraphics();

		// gameplay values
		this.hsp = 0;
		this.vsp = 0;
		this._gravity = 0.3;

		// debug
		window.player = this;
	}

	/**
	 * Setup the spritesheet and animation definitions
	 */
	_setupGraphics() {
		let defaultDelay = 5;

		this.setSprite({
			sheet: "player",

			animations: {
				default: "idle_right",

				"walk_right": {
					frames: [2, 3],
					delay: defaultDelay
				},
				"idle_right": {
					frames: [2]
				},

				"walk_left": {
					frames: [12, 13],
					delay: defaultDelay
				},
				"idle_left": {
					frames: [12]
				},

				"idle_rightup": {
					frames: [4]
				},
				"walk_rightup": {
					frames: [4, 5],
					delay: defaultDelay
				},

				"idle_leftup": {
					frames: [14]
				},
				"walk_leftup": {
					frames: [14, 15],
					delay: defaultDelay
				}
			}
		});
	}

	added() {
		log("Entity was added to the Screen!");
	}

	removed() {
		log("removed");
		Engine.screen.add(this);
	}

	update() {
		// check for the horizontal movement direction
		let xDif = 0;
		if (Keyboard.down(Keys.LEFT)) {
			xDif = -1;
			this._dirs.horizontal = "left";
		} else if (Keyboard.down(Keys.RIGHT)) {
			xDif = +1;
			this._dirs.horizontal = "right";
		}

		// check if the player is looking up for shooting
		if (Keyboard.down(Keys.UP)) {
			this._dirs.vertical = "up";
		} else if (Keyboard.down(Keys.DOWN)) {
			// nothing
			// this._dirs.vertical = "down";
		} else {
			// not looking up or down
			this._dirs.vertical = "";
		}

		// calculate horizontal speed
		this.hsp = xDif * 1;

		// vertical speed is based on the gravity value
		this.vsp = this.vsp + this._gravity;

		if (this.collidesWithTypes(["tiles"], false, this.x, this.y + 1) && Keyboard.pressed(Keys.S)) {
			this.vsp = -4;
		}

		// we only use the walk animations if we have a horizontal movement
		let animType = "idle";
		if (this.hsp != 0) {
			animType = "walk"
		}

		// horizontal collision checks
		if (this.collidesWithTypes(["tiles"], true, this.x + this.hsp, this.y).length > 0) {
			while(this.collidesWithTypes(["tiles"], true, this.x + Math.sign(this.hsp), this.y).length == 0) {
				this.x = this.x + Math.sign(this.hsp);
			}
			this.hsp = 0;
		}
		this.x += this.hsp;

		// vertical collision checks
		if (this.collidesWithTypes(["tiles"], true, this.x, this.y + this.vsp).length > 0) {
			while(this.collidesWithTypes(["tiles"], true, this.x, this.y + Math.sign(this.vsp)).length == 0) {
				this.y = this.y + Math.sign(this.vsp);
			}
			this.vsp = 0;
		}
		this.y += Math.floor(this.vsp); // floor the vsp so we don't end up on sub-pixels

		// play whatever animation
		this.playAnimation({name: `${animType}_${this._dirs.horizontal}${this._dirs.vertical}`});

		// move camera with player
		Engine.screen.cam.x = this.x - 70;
		//Engine.screen.cam.y = this.y - 78;
	}

}

export default Player;