import Screen from "../../../src/game/Screen.js";
import Entity from "../../../src/game/Entity.js";
import Keyboard from "../../../src/input/Keyboard.js";
import Keys from "../../../src/input/Keys.js";

const Layers = {
	COURT: 0,
	PLAYER_TOP: 1,
	BALL_SHADOW: 2,
	NET: 3,
	PLAYER_BOTTOM: 4,
	BALL: 5,
	UI: 6
}

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
		this.player.layer = Layers.PLAYER_TOP;
		this.add(this.player);

		// this.player.update = function() {
		// 	if (Keyboard.down(Keys.LEFT)) {
		// 		this.x--;
		// 	} else if (Keyboard.down(Keys.RIGHT)) {
		// 		this.x++;
		// 	}

		// 	if (Keyboard.down(Keys.UP)) {
		// 		this.y--;
		// 	} else if (Keyboard.down(Keys.DOWN)) {
		// 		this.y++;
		// 	}
		// };

		this.createBall();
	}

	createBall() {
		// BALL (NOT the actual ball position!)
		let ballEntity = this.ball = new Entity(100, 100);
		this.ball.layer = Layers.BALL;
		this.ball.configSprite({
			sheet: "ball",
			id: 1
		});
		this.add(this.ball);

		// SHADOW (actual Ball position!)
		this.ballShadow = new Entity(100, 110);
		this.ballShadow.steps = 0;
		this.ballShadow.layer = Layers.BALL_SHADOW;
		this.ballShadow.configSprite({
			sheet: "ball_shadow",
			id: 1
		});
		this.ballShadow.update = function() {
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

			this.steps+=0.05;
			let bounceStep = Math.cos(this.steps);
			ballEntity.x = this.x;
			ballEntity.y = this.y - (10 + 10 * bounceStep);

			ballEntity.configSprite({
				sheet: "ball",
				id: -Math.floor(4 * bounceStep)
			});

			this.configSprite({
				sheet: "ball_shadow",
				id: -Math.floor(4 * bounceStep)
			});
		};
		this.add(this.ballShadow);
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
		this._courtEntity.layer = Layers.COURT;
		this.add(this._courtEntity);

		// NET
		this._courtEntity = new Entity(0, 0);
		this._courtEntity.configSprite({
			"sheet": "net"
		});
		this._courtEntity.layer = Layers.NET;
		this.add(this._courtEntity);
	}
}

export default GameScreen;