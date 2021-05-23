// core imports
import AnimationBase from "../../core/animations/AnimationBase.js";

/**
 * Room scrolling animation.
 * Slowly scrolls from one Room to the next.
 */
class RoomScrolling extends AnimationBase {
	/**
	 * @override
	 * @param {object} info scrolling information, from/to Rooms
	 */
	setInfo(info) {
		this._map = info.to.getMap();

		// get final coordinates of the scroll animation
		this._targetX = info.to.dimensions.x_min;
		this._targetY = info.to.dimensions.y_min;

		// instant scrolling just sets the viewport to a fixed position
		if (info.instant) {
			this._map.viewport.x = this._targetX;
			this._map.viewport.y = this._targetY;
			// and we're done :)
			this.done();
		} else {
			// default scroll speed
			this._scrollSpeed = info.speed || 1;

			// get scroll direction
			this._xdir = Math.sign(this._targetX - info.from.dimensions.x_min) * this._scrollSpeed;
			this._ydir = Math.sign(this._targetY - info.from.dimensions.y_min) * this._scrollSpeed;
		}
	}

	/**
	 * @override
	 */
	animate() {
		if (this._map.viewport.x != this._targetX) {
			this._map.viewport.x += this._xdir;
		}
		if (this._map.viewport.y != this._targetY) {
			this._map.viewport.y += this._ydir;
		}

		if (this._map.viewport.y == this._targetY &&
			this._map.viewport.x == this._targetX) {
			this.done();
		}
	}
}

export default RoomScrolling;