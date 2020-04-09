class FrameCounter {
	constructor(maxFrames) {
		this._frames = 0;
		this._looped = 0;
		this._maxFrames = maxFrames;
	}

	isReady() {
		if (this._frames == this._maxFrames) {
			this.reset();
			this._looped++;
			return true;
		} else {
			this._frames++;
			return false;
		}
	}

	/**
	 * Returns the number of loops.
	 */
	looped() {
		return this._looped;
	}

	reset() {
		this._frames = 0;
	}
}

export default FrameCounter;