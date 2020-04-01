import Screen from "../../../src/game/Screen.js";
import Spritesheets from "../../../src/gfx/Spritesheets.js";
import Piece from "./Piece.js";
import Entity from "../../../src/game/Entity.js";
import Well from "./Well.js";
import RNG from "../../../src/utils/RNG.js";
import GFX from "../../../src/gfx/GFX.js";
import FrameCounter from "../../../src/utils/FrameCounter.js";
import { error } from "../../../src/utils/Log.js";
import Keyboard from "../../../src/input/Keyboard.js";
import Keys from "../../../src/input/Keys.js";

class GameScreen extends Screen {
	constructor() {
		super();

		RNG.seed(-9811, true);

		let bg = new Entity(0, 0);
		bg.layer = 0;
		bg.setSprite({
			sheet: "UI"
		});
		this.add(bg);

		this.inputDelay = new FrameCounter(3);

		this.dropCounter = new FrameCounter(90);

		Well.init(this);

		// create a new piece and implicitly add it as the "currentPiece" to the Well
		let p = new Piece(Piece.getRandomPieceType());
		Well.addPiece(p);
	}

	update() {
		super.update();
		let moved = false;

		if (Keyboard.pressed(Keys.LEFT)) {
			Well.movePiece(Well.getCurrentPiece(), -1, 0);
			moved = true;
		} else if (Keyboard.pressed(Keys.RIGHT)) {
			Well.movePiece(Well.getCurrentPiece(), 1, 0);
			moved = true;
		} else if (Keyboard.pressed(Keys.DOWN)) {
			this.dropPiece();
			moved = true;
		}

		// move piece if not already done via single button press
		if (!moved) {
			// with a delay so it's not to fast for the player
			if (this.inputDelay.isReady()) {
				if (Keyboard.down(Keys.LEFT)) {
					Well.movePiece(Well.getCurrentPiece(), -1, 0);
				} else if (Keyboard.down(Keys.RIGHT)) {
					Well.movePiece(Well.getCurrentPiece(), 1, 0);
				} else if (Keyboard.down(Keys.DOWN)) {
					this.dropPiece()
				}
			}
		} else {
			// If a piece was moved through a button-press we reset the delay.
			// This is done
			this.inputDelay.reset();
		}

		// rotate piece
		// no delay, as these are presses
		if (Keyboard.pressed(Keys.S)) {
			Well.rotatePiece(Well.getCurrentPiece(), Piece.DIRECTIONS.LEFT);
		} else if (Keyboard.pressed(Keys.D)) {
			Well.rotatePiece(Well.getCurrentPiece(), Piece.DIRECTIONS.RIGHT);
		}

		// drop piece
		if (this.dropCounter.isReady()) {
			// move the current piece down one row
			this.dropPiece();
		}
	}

	dropPiece() {
		// if a collision was detected -> we lock the piece and create a new one
		let locked = Well.movePiece(Well.getCurrentPiece(), 0, 1);
		if (locked) {
			let gameOver = Well.addPiece(new Piece(Piece.getRandomPieceType()));
			if (gameOver) {
				error("GAME OVER", "GameScreen");
			}
		}
		return locked;
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