class BaseAnimation {
	constructor() {
		this._isChain = false;
	}

	reset() {
		this._isDone = false;
	}

	setActor(actor) {
		this.actor = actor;
	}

	/**
	 * Lifecycle function for animation update
	 */
	_animate() {
		if (!this._isDone) {
			this.animate();
		}
		return this._isDone;
	}

	animate() {
		this.done();
	}

	isDone() {
		return this._isDone;
	}

	done() {
		this._isDone = true;
	}
}

export default BaseAnimation;