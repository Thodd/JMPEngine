import BaseAnimation from "./BaseAnimation.js";
import Constants from "../Constants.js";

class BumpAnimation extends BaseAnimation {
	constructor(actor) {
		super(actor);

		this.reset();
	}

	reset() {
		super.reset();
		this.dir = Constants.Directions.DOWN;
	}

	bumpTowards(goalTile) {
		let startTile = this.actor.getTile();
		this.dx       = -Math.sign(startTile.x - goalTile.x);
		this.dy       = -Math.sign(startTile.y - goalTile.y);
		this.steps      = 0;
		this.bumpLength = 4;

		if (this.dx === 0 && this.dy === 0) {
			this.done();
		}
	}

	animate() {
		this.steps++;
		this.actor.x += this.dx;
		this.actor.y += this.dy;

		if (this.steps == this.bumpLength) {
			this.dx *= -1;
			this.dy *= -1;
		}

		if (this.steps == this.bumpLength * 2) {
			this.done();
		}
	}
}

export default BumpAnimation;