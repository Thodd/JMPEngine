import AnimationBase from "../../core/animations/AnimationBase.js";

class ScreenShake extends AnimationBase {
	/**
	 * @override
	 * @param {object} info the map
	 */
	setInfo(info) {
		this._map = info.map;
		this._shakeCount = 0;
	}

	/**
	 * @override
	 */
	animate() {
		// I know this code is pretty braindead... but you know what?
		// It works pretty well for a simple visual effect-
		// You could use a FrameCounter though ;)
		if (this._shakeCount == 0) {
			this._map.x -= 2;
		} else if (this._shakeCount == 1) {
			this._map.x += 2;
		} else if (this._shakeCount == 2) {
			this._map.x += 2;
		} else {
			this._map.x -= 2;
			this.done();
		}

		this._shakeCount++;
	}
}

export default ScreenShake;