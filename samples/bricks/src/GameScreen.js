import Screen from "../../../src/game/Screen.js";
import Entity from "../../../src/game/Entity.js";
import Text from "../../../src/gfx/Text.js";
import FrameCounter from "../../../src/utils/FrameCounter.js";
import { error } from "../../../src/utils/Log.js";
import Keyboard from "../../../src/input/Keyboard.js";
import Keys from "../../../src/input/Keys.js";

import Manifest from "../../../src/Manifest.js";

import Score from "./Score.js";
import Well from "./Well.js";
import Piece from "./Piece.js";
import PieceBag from "./PieceBag.js";
import BGRenderer from "./BGRenderer.js";
import Engine from "../../../src/Engine.js";
import LevelSelectScreen from "./LevelSelectScreen.js";

class GameScreen extends Screen {
	constructor() {
		super();

		this.getLayers(0).clearColor = "#38a8f2";

		// preview and hold
		this.currentPreview = [];
		this.canHold = true;
		this.currentHoldType = null;

		// timers
		this.inputDelay = new FrameCounter(3);
		this.dropTimer = new FrameCounter(Score.speed);

		this.setupBGandUI();

		Well.init(this);

		// create a new piece and implicitly add it as the "currentPiece" to the Well
		this.spawnPiece();
	}

	/**
	 * Creates the BG animation
	 */
	setupBGandUI() {
		this.add(new BGRenderer());

		// UI
		let ui = new Entity(0, 0);
		ui.layer = 1;
		ui.setSprite({
			sheet: "UI"
		});
		this.add(ui);

		// Scoring
		this.scoringTexts = {
			points: new Text("0", 75, 49),
			level:  new Text("0", 75, 89),
			lines:  new Text("0", 75, 129)
		}
		this.scoringTexts.lines.layer = 3;
		this.scoringTexts.points.layer = 3;
		this.scoringTexts.level.layer = 3;

		this.scoringTexts.lines.color = "#FF8500";
		this.scoringTexts.points.color = "#FF8500";
		this.scoringTexts.level.color = "#FF8500";

		this.add(this.scoringTexts.lines);
		this.add(this.scoringTexts.points);
		this.add(this.scoringTexts.level);
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
	 * GameScreen update loop, called every frame.
	 */
	update() {
		super.update();

		if (this.gameOver) {
			if (Keyboard.pressed(Keys.ESC)) {
				Engine.screen = new LevelSelectScreen();
				Score.reset();
			}
			return;
		}

		if (this._cleanupAnimations) {
			return;
		}

		// handle key-presses
		let moved = this.handlePieceMovementInput("pressed");
		if (Keyboard.pressed(Keys.UP)) {
			this.hardDrop();
			moved = true;
		}

		// hold block
		if (this.canHold && Keyboard.pressed(Keys.A)) {
			let holdType = this.currentHoldType;
			// keep the current type
			this.currentHoldType = Well.getCurrentPiece().type;
			Well.removePiece();
			this.spawnPiece(holdType);
			this.canHold = false;
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

		// make sure the ghost brick is always at the bottom of the well
		Well.updateGhostPiece();

		// might change the game speed, depending on the # of cleared lines
		this.updateSpeed();

		this.updateScoringUI();
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
			Well.lockCurrentPiece();

			// clean up lines
			this._cleanupAnimations = Well.cleanUp();

			// sometimes we need to wait for the clean-up animation before spawning a new piece
			if (this._cleanupAnimations) {
				this._cleanupAnimations.then(() => {
					delete this._cleanupAnimations;
					this.spawnPiece();
				});
			} else {
				this.spawnPiece();
			}

		}
		// if the piece was dropped we reset the dropCounter
		// this is done so we don't drop twice in a frame: once by the player and once by the timer
		this.dropTimer.reset();
		return locked;
	}

	/**
	 * Spawns a new Piece with the given Type.
	 * @param {Piece.TYPE} type The type which will be spawned
	 */
	spawnPiece(type) {
		// spawn a piece of the given type, or take one from the PieceBag
		let p;
		if (type) {
			p = PieceBag.create(type);
		} else {
			p = PieceBag.next();
		}

		// new piece & game over check
		this.gameOver = Well.addPiece(p);
		if (this.gameOver) {
			this.createGameOverlay();
			error("GAME OVER", "GameScreen");
		}

		// reactivate holding after a new piece has spawned
		this.canHold = true;

		this.updatePreviewAndHold();
	}

	/**
	 * Practically a loop which continuously drops the piece
	 * until it locks in.
	 */
	hardDrop() {
		if (!this.dropPiece()) {
			this.hardDrop();
		} else {
			// locked in on hard drop scores some points
			// increases based on the level
			Score.addHardDrop();
		}
	}

	/**
	 * Updtes the Preview Pieces and renders the Hold Piece if given.
	 */
	updatePreviewAndHold() {
		// destroy old preview
		// it's simpler to destroy and recreate all preview pieces, than to shift them
		this.currentPreview.forEach((p) => {
			p.destroy();
		});
		this.currentPreview = [];

		// create new preview
		let nextTypes = PieceBag.peek(3);
		nextTypes.forEach((t, i) => {
			let p = PieceBag.create(t, true);
			p.move(22, 4+3*i);
			// add bricks to the screen
			p.bricks.forEach((b) => {
				this.add(b);
			});
			this.currentPreview.push(p);
		});

		// destroy old hold piece
		if (this.currentHoldPiece) {
			this.currentHoldPiece.destroy();
		}

		// create new hold piece
		if (this.currentHoldType) {
			this.currentHoldPiece = PieceBag.create(this.currentHoldType, true);
			this.currentHoldPiece.move(22, 17);
			this.currentHoldPiece.bricks.forEach((b) => {
				this.add(b);
			});
		}
	}

	updateSpeed() {
		if (Score.levelIncreased) {
			this.dropTimer = new FrameCounter(Score.speed);
			Score.levelIncreased = false;
		}
	}

	/**
	 * Updates the Scoring Table UI.
	 */
	updateScoringUI() {
		// calculate text shift to the left
		let fontWidth = Manifest.get("/assets/fonts/font0/w");

		function shiftAndSet(e, text) {
			e.x = 76 - (Math.max(text.length - 1, 0) * fontWidth);
			e.setText(text);
		}

		shiftAndSet(this.scoringTexts.points, `${Score.points}`);
		shiftAndSet(this.scoringTexts.level,  `${Score.level}`);
		shiftAndSet(this.scoringTexts.lines,  `${Score.getLines()}`);
	}

	createGameOverlay() {
		// GameOver overlay
		let offX = 104, offY = 50;
		let gameOverUI = new Entity(offX, offY);
		gameOverUI.layer = 3;
		gameOverUI.setSprite({
			sheet: "GameOver"
		});
		this.add(gameOverUI);

		// GAME OVER! text
		// Ok, I got a bit lazy here and just hacked this together...
		let t = new Text("GAME OVER!", offX+5, offY+5);
		t.layer = 3;
		t.color = "#FF3333";
		t.sad = true;
		t.blinkTimer = new FrameCounter(12);
		t.flip = function() {
			if (this.sad) {
				this.color = "#FF3333";
				this.text = "GAME OVER!";
			} else {
				this.color = "#FFFFFF";
				this.text = "    :(";
			}
			this.sad = !this.sad;
		};
		t.update = function(){
			if (this.blinkTimer.isReady()) {
				this.flip();
			}
		};
		this.add(t);

		// continue text
		let c = new Text("Press ESC\n  key to\ncontinue!", offX+9, offY+31);
		c.layer = 3;
		this.add(c);
	}

	render() {
		super.render();

		// debug rendering of current piece origin
		/*let sheet = Spritesheets.getSheet("bricks");
		let p = Well.getCurrentPiece();
		let originX = sheet.w * (Well.ORIGIN_X + p.well_x);
		let originY = sheet.h * (Well.ORIGIN_Y + p.well_y);
		GFX.px(originX,     originY,     "#ffffff", 2);
		GFX.px(originX + 1, originY,     "#ffffff", 2);
		GFX.px(originX    , originY + 1, "#ffffff", 2);
		GFX.px(originX + 1, originY + 1, "#ffffff", 2);*/
	}
}

export default GameScreen;