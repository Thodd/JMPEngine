class FrameCounter {
	constructor(maxFrames) {
		this._frames = 0;
		this._maxFrames = maxFrames;
	}

	isReady() {
		if (this._frames == this._maxFrames) {
			this._frames = 0;
			return true;
		} else {
			this._frames++;
			return false;
		}
	}
}

export default FrameCounter;