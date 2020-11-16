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

	bumpInDirection(dir) {
		this.dir   = dir;
		this.xDif  = 0;
		this.yDif  = 0;
		this.steps = 0;
		this.bumpLength = 4;

		switch(dir) {
			case Constants.Directions.LEFT:  this.xDif = -1; this.yDif =  0; break;
			case Constants.Directions.RIGHT: this.xDif = +1; this.yDif =  0; break;
			case Constants.Directions.UP:    this.xDif =  0; this.yDif = -1; break;
			default:
			case Constants.Directions.DOWN:  this.xDif =  0; this.yDif = +1; break;
		}
	}

	animate() {
		this.steps++;
		this.actor.x += this.xDif;
		this.actor.y += this.yDif;

		if (this.steps == this.bumpLength) {
			this.xDif *= -1;
			this.yDif *= -1;
		}

		if (this.steps == this.bumpLength * 2) {
			this.done();
		}
	}
}

export default BumpAnimation;