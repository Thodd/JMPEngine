import Screen from "../../../src/game/Screen.js";
import Spritesheets from "../../../src/gfx/Spritesheets.js";
import Entity from "../../../src/game/Entity.js";
import GFX from "../../../src/gfx/GFX.js";
import FrameCounter from "../../../src/utils/FrameCounter.js";
import { error } from "../../../src/utils/Log.js";
import Keyboard from "../../../src/input/Keyboard.js";
import Keys from "../../../src/input/Keys.js";

import Well from "./Well.js";
import Piece from "./Piece.js";
import PieceBag from "./PieceBag.js";

class GameScreen extends Screen {
	constructor() {
		super();

		this.setupBGandUI();

		this.inputDelay = new FrameCounter(3);

		this.dropTimer = new FrameCounter(90);

		Well.init(this);

		// create a new piece and implicitly add it as the "currentPiece" to the Well
		let p = PieceBag.next();
		Well.addPiece(p);
	}

	setupBGandUI() {
		// BG 0, 0
		this._bg00 = new Entity(0, 0);
		this._bg00.layer = 0;
		this._bg00.setSprite({
			sheet: "BG"
		});
		this.add(this._bg00);

		// BG 1, 0
		this._bg10 = new Entity(256, 0);
		this._bg10.layer = 0;
		this._bg10.setSprite({
			sheet: "BG"
		});
		this.add(this._bg10);

		// BG 0, 1
		this._bg01 = new Entity(0, 192);
		this._bg01.layer = 0;
		this._bg01.setSprite({
			sheet: "BG"
		});
		this.add(this._bg01);

		// BG 1, 1
		this._bg11 = new Entity(256, 192);
		this._bg11.layer = 0;
		this._bg11.setSprite({
			sheet: "BG"
		});
		this.add(this._bg11);

		// UI
		let ui = new Entity(0, 0);
		ui.layer = 0;
		ui.setSprite({
			sheet: "UI"
		});
		this.add(ui);
	}

	updateBG() {
		this._bg00.x -= 0.3;
		this._bg00.y -= 0.3;

		this._bg01.x -= 0.3;
		this._bg01.y -= 0.3;

		this._bg10.x -= 0.3;
		this._bg10.y -= 0.3;

		this._bg11.x -= 0.3;
		this._bg11.y -= 0.3;

		[this._bg00, this._bg01, this._bg10, this._bg11].forEach((bg) => {
			if ((bg.x + 256) <= 0) {
				bg.x = 256;
			}
			if ((bg.y + 192) <= 0) {
				bg.y = 192;
			}
		});
	}

	/**
	 * Handles Piece movements.
	 * @param {string} inputCheck name of the input check function.
	 */
	handlePieceMovementInput(inputCheckFunction) {
		let moved = false;

		// only left, right and down are checked
		// up-key is for hard-drops and those can only occur on a button press once each frame
		if (Keyboard[inputCheckFunction](Keys.LEFT)) {
			Well.movePiece(Well.getCurrentPiece(), -1, 0);
			moved = true;
		} else if (Keyboard[inputCheckFunction](Keys.RIGHT)) {
			Well.movePiece(Well.getCurrentPiece(), 1, 0);
			moved = true;
		} else if (Keyboard[inputCheckFunction](Keys.DOWN)) {
			this.dropPiece();
			moved = true;
		}

		return moved;
	}

	/**
	 * Update loop, called every frame.
	 */
	update() {
		super.update();

		this.updateBG();

		// handle key-presses
		let moved = this.handlePieceMovementInput("pressed");
		if (Keyboard.pressed(Keys.UP)) {
			this.hardDrop();
			moved = true;
		}

		// move piece while key is down
		// but not if it was already moved via single button press in this frame
		if (!moved) {
			// with a delay so it's not to fast for the player
			if (this.inputDelay.isReady()) {
				this.handlePieceMovementInput("down");
			}
		} else {
			// If a piece was moved through a button-press we reset the delay.
			// This is done to allow for single pressed buttons to be handled,
			// before the "hold-down" state is checked again
			this.inputDelay.reset();
		}

		// rotate piece
		// no delay, as these are presses
		if (Keyboard.pressed(Keys.S)) {
			Well.rotatePiece(Well.getCurrentPiece(), Piece.DIRECTIONS.LEFT);
		} else if (Keyboard.pressed(Keys.D)) {
			Well.rotatePiece(Well.getCurrentPiece(), Piece.DIRECTIONS.RIGHT);
		}

		// drop piece after a fixed set of frames (gets faster every level)
		if (this.dropTimer.isReady()) {
			// move the current piece down one row
			this.dropPiece();
		}
	}

	/**
	 * Drops the current piece down by one tile.
	 * Checks if the piece has locked in, and if so creates a new piece at the top of the well.
	 * If the new piece overlaps any existing ones, the player is game-over
	 */
	dropPiece() {
		// if a collision was detected -> we lock the piece and create a new one
		let locked = Well.movePiece(Well.getCurrentPiece(), 0, 1);
		if (locked) {
			Well.getCurrentPiece().lock();

			// clean up lines
			Well.cleanUp();

			// new piece & game over check
			let gameOver = Well.addPiece(PieceBag.next());
			if (gameOver) {
				error("GAME OVER", "GameScreen");
			}
		}
		// if the piece was dropped we reset the dropCounter
		// this is done so we don't drop twice in a frame: once by the player and once by the timer
		this.dropTimer.reset();
		return locked;
	}

	/**
	 * Practically a loop which continuously drops the piece
	 * until it locks in.
	 */
	hardDrop() {
		if (!this.dropPiece()) {
			this.hardDrop();
		}
	}

	render() {
		super.render();

		// debug rendering of current piece origin
		let sheet = Spritesheets.getSheet("bricks");
		let p = Well.getCurrentPiece();
		let originX = sheet.w * (Well.ORIGIN_X + p.well_x);
		let originY = sheet.h * (Well.ORIGIN_Y + p.well_y);
		GFX.px(originX,     originY,     "#ffffff", 2);
		GFX.px(originX + 1, originY,     "#ffffff", 2);
		GFX.px(originX    , originY + 1, "#ffffff", 2);
		GFX.px(originX + 1, originY + 1, "#ffffff", 2);
	}
}

export default GameScreen;