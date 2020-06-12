import BaseAnimation from "./BaseAnimation.js";
import Constants from "../Constants.js";

class MovementAnimation extends BaseAnimation {
	constructor(actor) {
		super(actor);

		this.speed = 1;

		this.reset();
	}

	reset() {
		super.reset();

		this.startX = 0;
		this.startY = 0;
		this.goalX = 0;
		this.goalY = 0;
		this.dx = 0;
		this.dy = 0;
	}

	setValues(startX, startY, goalX, goalY) {
		this.startX = startX * Constants.TILE_WIDTH;
		this.startY = startY * Constants.TILE_HEIGHT;

		this.goalX  = goalX  * Constants.TILE_WIDTH;
		this.goalY  = goalY  * Constants.TILE_HEIGHT;

		this.dx = Math.sign(goalX - startX);
		this.dy = Math.sign(goalY - startY);
	}

	animate() {
		if (!this._isDone) {
			this.actor.x += this.speed * this.dx;
			this.actor.y += this.speed * this.dy;

			if (this.actor.x == this.goalX && this.actor.y == this.goalY) {
				this._isDone = true;
			}
		}

		return this._isDone;
	}
}

export default MovementAnimation;