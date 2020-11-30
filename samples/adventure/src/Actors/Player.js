import Keyboard from "../../../../src/input/Keyboard.js";
import Keys from "../../../../src/input/Keys.js";
import { log } from "../../../../src/utils/Log.js";
import Constants from "../Constants.js";
import BaseActor from "./BaseActor.js";
import AnimationPool from "../animations/AnimationPool.js";
import MovementAnimation from "../animations/MovementAnimation.js";
// import BumpAnimation from "../animations/BumpAnimation.js";

class Player extends BaseActor {
	constructor({gameTile}) {
		super({gameTile});

		this.isBlocking = true;

		this.layer = this.layer = Constants.Layers.PLAYER;

		this._lastDir = "down";

		this.checkForInput = true;

		this._scheduledAnimations = [];

		this.configSprite({
			sheet: "player",

			offset: {
				x: -3,
				y: -7
			},

			//color: Constants.Colors.YELLOW_LIGHT,

			animations: {
				default: "down",

				"left": {
					frames: [0, 1],
					dt: 40
				},

				"right": {
					frames: [2, 3],
					dt: 40
				},

				"down": {
					frames: [4, 5],
					dt: 40
				},

				"up": {
					frames: [6, 7],
					dt: 40
				}
			}
		});
	}

	toString() {
		return `Player#${this._id}`;
	}

	takeTurn() {
		// GC has passed us priority so we activate input check during the game loop
		this.checkForInput = true;
		log("taking turn - waiting for input", "Player");
	}

	endTurn() {
		// once the player turn ends we stop checking for input
		// and wait until the GC gives us priority again
		this.checkForInput = false;

		// notify the GC that the player has made their turn
		this.getGameController().endPlayerTurn(this._scheduledAnimations);
		this._scheduledAnimations = [];

		log("turn ended", "Player");
	}

	scheduleAnimation(anim) {
		this._scheduledAnimations.push(anim);
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

				let startTile = this.gameTile;
				let goalTile = this.getTilemap().get(startTile.x + xDif, startTile.y + yDif);

				// if we are out of bounds, the tilemap does not return a tile,
				if (goalTile && goalTile.isFree()) {
					// move Actor to tile
					// The MovementAnimation is only animating the Sprite, the Actor on the Tilemap has to be moved manually!
					this.moveToTile(goalTile);

					// start pixel-based MovementAnimation from one tile to another
					let moveAnim = AnimationPool.get(MovementAnimation, this);
					moveAnim.moveFromTo(startTile, goalTile);
					this.scheduleAnimation(moveAnim);
				}

				this.endTurn();
			}
		}

		this.playAnimation({name: `${this._lastDir}`});

		this.centerCamera();
	}

	centerCamera() {
		let s = this.getScreen();
		s.cam.x = this.x - Constants.SCREEN_WIDTH_IN_TILES_HALF * Constants.TILE_WIDTH;
		s.cam.y = this.y - Constants.SCREEN_HEIGHT_IN_TILES_HALF * Constants.TILE_HEIGHT;
	}
}

export default Player;