class FrameCounter {
	constructor(maxFrames) {
		this._frames = 0;
		this._maxFrames = maxFrames;
	}

	isReady() {
		if (this._frames == this._maxFrames) {
			this.reset();
			return true;
		} else {
			this._frames++;
			return false;
		}
	}

	reset() {
		this._frames = 0;
	}
}

export default FrameCounter;