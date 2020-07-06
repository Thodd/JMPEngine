class FrameCounter {
	constructor(maxFrames) {
		this._frames = 0;
		this._looped = 0;
		this._maxFrames = maxFrames;
	}

	isReady() {
		if (this._frames == this._maxFrames) {
			this._frames = 0;
			this._looped++;
			return true;
		} else {
			this._frames++;
			return false;
		}
	}

	/**
	 * Changes the max number of frames before isReady returns true.
	 * <b>Beware</b>: Changing the max frames will reset the current frame count to 0!
	 * @param {integer} m max number of frames
	 */
	setMaxFrames(m) {
		this._maxFrames = m;
		this._frames = 0;
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