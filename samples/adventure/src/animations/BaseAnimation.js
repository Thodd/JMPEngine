class BaseAnimation {
	constructor(actor) {
		this.actor = actor;
		this._isDone = false;
	}

	release() {
		this.reset();
	}

	reset() {
		this._isDone = false;
	}

	setActor(actor) {
		this.actor = actor;
	}

	animate() {
		if (!this._isDone) {
			this._isDone = true;
		}
	}

	isDone() {
		return this._isDone;
	}
}

export default BaseAnimation;