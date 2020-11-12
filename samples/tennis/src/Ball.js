import Entity from "../../../src/game/Entity.js";
import Constants from "./Constants.js";

class Ball extends Entity {
	constructor(x, y, screen) {
		super(x, y);

		// BALL (NOT the actual ball position!)
		this.gfxBall = new Entity(x, y-10);
		this.gfxBall.layer = Constants.Layers.BALL;
		this.gfxBall.configSprite({
			sheet: "ball",
			id: 0
		});
		screen.add(this.gfxBall);

		// SHADOW (actual Ball position!)
		this.gfxBallShadow = new Entity(x, y);
		this.gfxBallShadow.layer = Constants.Layers.BALL_SHADOW;
		this.gfxBallShadow.configSprite({
			sheet: "ball_shadow",
			id: 2
		});
		screen.add(this.gfxBallShadow);

		this.steps = 0;
	}

	update() {
		if (this.target) {
			if (this.x < this.target.x) {
				if (this.x != this.target.x) {
					this.x += 0.5;
				}
				if (this.y != this.target.y) {
					this.y = this.y + this.target.slope/2;
				}
			} else {
				this.target = null;
			}
		}

		// update GFX entities
		this.gfxBallShadow.x = this.x;
		this.gfxBallShadow.y = this.y;
		this.gfxBall.x = this.x;
		this.gfxBall.y = this.y;

		// this.steps+=0.05;
		// let bounceStep = Math.cos(this.steps);
		// this.gfxBall.y = this.gfxBall.y - (10 + 10 * bounceStep);

		// this.gfxBall.configSprite({
		// 	sheet: "ball",
		// 	id: Math.floor(0 * bounceStep)
		// });

		// this.configSprite({
		// 	sheet: "ball_shadow",
		// 	id: 2
		// });
	}

	getPosition() {
		return {
			x: this.gfxBallShadow.x,
			y: this.gfxBallShadow.y
		};
	}

	moveTo(target) {
		this.start = this.getPosition();
		this.target = target;
		this.target.slope = (target.y - this.start.y) / (target.x - this.start.x);
	}
}

export default Ball;