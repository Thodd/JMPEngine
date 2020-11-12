import Screen from "../../../src/game/Screen.js";
import Entity from "../../../src/game/Entity.js";
import Keyboard from "../../../src/input/Keyboard.js";
import Keys from "../../../src/input/Keys.js";
import { log } from "../../../src/utils/Log.js";

import Constants from "./Constants.js";
import Ball from "./Ball.js";

class GameScreen extends Screen {
	constructor() {
		super();

		this.setupCourt();

		// PLAYER
		this.player = new Entity(80, 30);
		this.player.configSprite({
			sheet: "player",
			animations: {
				"default": "down",
				"down": {frames: [0, 1, 0, 2], dt: 8},
				"down_idle": {frames: [0]}
			}
		});
		this.player.layer = Constants.Layers.PLAYER_TOP;
		this.add(this.player);

		this.player.update = function() {
			if (Keyboard.down(Keys.LEFT)) {
				this.x--;
			} else if (Keyboard.down(Keys.RIGHT)) {
				this.x++;
			}

			if (Keyboard.down(Keys.UP)) {
				this.y--;
			} else if (Keyboard.down(Keys.DOWN)) {
				this.y++;
			}
		};

		this.ball = new Ball(43, 205, this);
		this.add(this.ball);
		window.ball = this.ball;
	}

	/**
	 * Create static Court GFX
	 */
	setupCourt() {
		// COURT
		this._courtEntity = new Entity(0, 0);
		this._courtEntity.configSprite({
			"sheet": "court"
		});
		this._courtEntity.layer = Constants.Layers.COURT;
		this.add(this._courtEntity);

		// NET
		this._courtEntity = new Entity(0, 0);
		this._courtEntity.configSprite({
			"sheet": "net"
		});
		this._courtEntity.layer = Constants.Layers.NET;
		this.add(this._courtEntity);
	}
}

export default GameScreen;