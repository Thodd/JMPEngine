import Keyboard from "../../../../../src/input/Keyboard.js";
import Keys from "../../../../../src/input/Keys.js";

class GameController {
	constructor(gameScreen) {
		// keep a reference on the GameScreen instance and retrieve the RLMap from it
		// a GameController is always tied to a GameScreen and cannot be reused, so its
		// safe to keep shorthand references to the RLMap and the player RLActor instance
		this._gameScreen = gameScreen;
		this._map = gameScreen.getMap();
		this._player = this._map.getPlayerActor();

		// initially we start with the room the player was placed in
		this._currentRoom = this._player.getRoom();

		// register event handler for input
		Keyboard.registerEndOfFrameHandler(this.handleInput.bind(this));

		this._canMove = true;
	}

	endPlayerTurn() {
		// we synchronously calculate all NPC turns & schedule their animations
		// this.timeline.advanceNPCs();

		// which goes over to the animation phase again
		// this.animationsRunning = true;
	}

	update() {

		// TODO: Get scrolling to work somehow...


		let pc = this._player.getCell();
		let dim = this._currentRoom.dimensions;
		if (pc.x < dim.x_min || pc.x > dim.x_max) {
			this._canMove = false;
		} else {
			return;
		}

		let dx = pc.x < dim.x_min ? -1 : 1;

		this._i = this._i || 0;
		this._i++;
		if (this._i <= 60) {
			this._map.viewport.x += dx;
		} else {
			this._canMove = true;
		}



		// during the animation phase we update the system
		if (this.animationsRunning) {
			let animationsFinished = this.animationSystem.update();

			if (animationsFinished) {
				// now give the player priority to do inputs
				//PlayerState.takeTurn();

				// we wait for the player & NPC turns to end now for the next animation phase
				this.animationsRunning = false;
			}
		}
	}

	handleInput() {
		if (!this._canMove) {
			return;
		}
		let c = this._player.getCell();
		let dx = 0;
		let dy = 0;
		if (Keyboard.wasPressedOrIsDown(Keys.LEFT)) {
			dx = -1;
		} else if (Keyboard.wasPressedOrIsDown(Keys.RIGHT)) {
			dx = +1;
		}
		if (Keyboard.wasPressedOrIsDown(Keys.UP)) {
			dy = -1;
		} else if (Keyboard.wasPressedOrIsDown(Keys.DOWN)) {
			dy = +1;
		}

		this._player.moveTo(this._map.get(c.x + dx, c.y + dy));
	}
}

export default GameController;