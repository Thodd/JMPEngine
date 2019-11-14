import Actor from "./Actor.js";
import Engine from "../../../../src/Engine.js";
import { log } from "../../../../src/utils/Log.js";
import Keyboard from "../../../../src/input/Keyboard.js";
import Keys from "../../../../src/input/Keys.js";
import FrameCounter from "../../../../src/utils/FrameCounter.js";


class Player extends Actor {
	constructor(x, y) {
		super(x, y);

		// initial values
		this.x = 70;
		this.y = 78;
		this.layer = 2;

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
		this._boost = 2;
		this._dy = 0;
		this._maxDy = 3;
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

		// apply gravity
		// roughly copied from this tutorial: https://nerdyteachers.com/Explain/Platformer/

		// check what is below the player
		let floorCollision = this.collidesWithTypes(["tiles"], true, this.x, this.y + 1);

		if (floorCollision.length == 0) {
			this._dy += this._gravity;
			this.y += this._dy;
			this.y = Math.round(this.y);
		}

		// clamp
		if (this._dy > 0) {
			this._isFalling = true;
			if (floorCollision.length > 0) {
				this._isJumping = false;
				this._dy = 0;
				// move out of stuck tile
				this.y -= ((this.y+this.hitbox.y+this.hitbox.h+1)%8)-1;
			}
		}

		if (Keyboard.down(Keys.S) && !this._isFalling && this._isJumping && this._dy > -this._maxDy) {
			this._dy -= 0.5;
		} else {
			this._isFalling = true;
		}

		// jump only when we stand on a floor
		if (Keyboard.pressed(Keys.S) && floorCollision.length > 0) {
			this._isJumping = true;
			this._isFalling = false;
			this._dy -= this._boost
			this.y--;
		}


		// delay the input a bit
		if (this._inputDelay.isReady()) {
			//return;
		}

		let xDif = 0;

		if (Keyboard.down(Keys.LEFT)) {
			xDif = -1;
			this._dirs.horizontal = "left";
		} else if (Keyboard.down(Keys.RIGHT)) {
			xDif = +1;
			this._dirs.horizontal = "right";
		}

		if (Keyboard.down(Keys.UP)) {
			this._dirs.vertical = "up";
		} else if (Keyboard.down(Keys.DOWN)) {
			// nothing
			// this._dirs.vertical = "down";
		} else {
			// not looking up or down
			this._dirs.vertical = "";
		}

		let animType = "idle";
		if (xDif != 0) {
			if (this.collidesWithTypes(["tiles"], true, this.x + xDif, this.y).length == 0) {
				this.x += xDif;
				animType = "walk"
			}
		}

		this.playAnimation({name: `${animType}_${this._dirs.horizontal}${this._dirs.vertical}`});

		Engine.screen.cam.x = this.x - 70;
		//Engine.screen.cam.y = this.y - 78;
	}

}

export default Player;