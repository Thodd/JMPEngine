import Keyboard from "../../../../src/input/Keyboard.js";
import Keys from "../../../../src/input/Keys.js";
import { log } from "../../../../src/utils/Log.js";
import Constants from "../Constants.js";
import BaseActor from "./BaseActor.js";
import AnimationPool from "../animations/AnimationPool.js";
import MovementAnimation from "../animations/MovementAnimation.js";

class Player extends BaseActor {
	constructor({gc, map_x, map_y}) {
		super({gc, map_x, map_y});

		this.layer = 2;

		this._lastDir = "down";

		this.checkForInput = true;

		this._scheduledAnimations = [];

		this.setSprite({
			sheet: "characters",

			offsetY: 0,

			animations: {
				default: "down",

				"down": {
					frames: [16, 17],
					delay: 30
				},

				"up": {
					frames: [18, 19],
					delay: 30
				},

				"left": {
					frames: [0, 1],
					delay: 30
				},

				"right": {
					frames: [2, 3],
					delay: 30
				}
			}
		});
	}

	takeTurn() {
		// GC has passed us priority so we activate input check during the game loop
		this.checkForInput = true;
		log("player turn");
	}

	endTurn() {
		// once the player turn ends we stop checking for input
		// and wait until the GC gives us priority again
		this.checkForInput = false;

		// notify the GC that the player has made their turn
		this.gameController.endPlayerTurn(this._scheduledAnimations);
		this._scheduledAnimations = [];
	}

	update() {
		if (this.checkForInput) {
			let xDif = 0;
			let yDif = 0;

			if (Keyboard.down(Keys.LEFT)) {
				xDif = -1;
				this._lastDir = "left";
			} else if (Keyboard.down(Keys.RIGHT)) {
				xDif = +1;
				this._lastDir = "right";
			}

			if (Keyboard.down(Keys.UP)) {
				yDif = -1;
				this._lastDir = "up";
			} else if (Keyboard.down(Keys.DOWN)) {
				yDif = +1;
				this._lastDir = "down";
			}

			// we have some direction input, so we start a movement animation
			if (xDif != 0 || yDif != 0) {

				let startX = this.map_x;
				let startY = this.map_y;
				this.map_x += xDif;
				this.map_y += yDif;

				let moveAnim = AnimationPool.get(MovementAnimation, this);
				moveAnim.setValues(startX, startY, this.map_x, this.map_y);
				this._scheduledAnimations.push(moveAnim);

				this.endTurn();
			}
		}

		this.playAnimation({name: `${this._lastDir}`});

		this.centerCamera();
	}

	centerCamera() {
		let s = this.getScreen();
		s.cam.x = this.x - 7 * Constants.TILE_WIDTH;
		s.cam.y = this.y - 7 * Constants.TILE_HEIGHT;
	}
}

export default Player;