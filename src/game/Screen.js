import ArrayHelper from "../utils/ArrayHelper.js";
import GFX from "../gfx/GFX.js";
import { error } from "../utils/Log.js";

class Screen {
	constructor() {
		this._ID = Screen.INSTANCE_COUNT++;
		this._entities = [];
		this._toBeAdded = [];
		this._toBeRemoved = [];

		this._clearLayers = Object.create(null);
	}

	toString() {
		return `${this.constructor.name} (${this._ID})`;
	}

	/**
	 * Defines which layers should be cleared on every frame before rendering.
	 * @example
	 * Engine.screen.clearLayer(0, "#111111");
	 * @param {int} layer the layer which should be cleared during rendering
	 * @param {string} color a CSS color string, e.g. "transparent", "#FF0085"
	 */
	clearLayer(layer, color) {
		this._clearLayers[layer] = {i: layer, color: color};
	}

	/**
	 * Schedules the given entity for adding to the
	 * Screen at the end of the current frame.
	 */
	add(e) {
		var isScheduled = ArrayHelper.contains(e, this._toBeAdded);
		if (!e._screen && !isScheduled && !e._isDestroyed) {
			// check if scheduled for removal
			ArrayHelper.remove(e, this._toBeRemoved);

			// finally schedule for adding at the end of the frame
			this._toBeAdded.push(e);
		} else {
			// error cases
			if (e._screen) {
				error(`Entity already added to ${e._screen}!`);
			} else if (isScheduled) {
				error(`Entity already scheduled for adding to ${this}!`);
			} else if (e._isDestroyed) {
				error("Entity was already destroyed and cannot be added to a Screen again!");
			}
		}
	}

	/**
	 * Schedules the given entity for removal from the
	 * Screen at the end of the current frame.
	 */
	remove(e) {
		var isScheduled = ArrayHelper.contains(e, this._toBeRemoved);
		if (e._screen == this && !isScheduled) {
			// check if scheduled for adding
			ArrayHelper.remove(e, this._toBeAdded);

			this._toBeRemoved.push(e);
		} else {
			if (e._screen != this) {
				error(`Entity already added to ${e._screen}!`);
			} else if (isScheduled) {
				error(`Entity already scheduled for removal from ${this}!`);
			} else if (e._isDestroyed) {
				error("Entity was already destroyed and cannot be removed from the Screen again!");
			}
		}
	}

	// Lifecycle hook, called once the Screen begins
	begin() {}

	// Lifecycle hook, called once the Screen ends
	end() {}

	update() {
		// update entities
		this._entities.forEach(function(e) {
			if (e && e.active && !e._isDestroyed) {
				e.update();
			}
		});

		// clean up
		// add scheduled entities
		var lenA = this._toBeAdded.length;
		for (var i = 0; i < lenA; i++) {
			var ea = this._toBeAdded[i];
			this._entities.push(ea);
			ea._screen = this;
			ea.added();
		}
		this._toBeAdded = [];

		// remove scheduled entities
		var lenR = this._toBeRemoved.length;
		for (var j = 0; j < lenR; j++) {
			var er = this._toBeRemoved[j];
			ArrayHelper.remove(er, this._entities);
			er._screen = null;
			er.removed();
		}
		this._toBeRemoved = [];
	}

	render() {
		// clear layers
		for (let s in this._clearLayers) {
			let layer = this._clearLayers[s];
			GFX.clear(layer.i, layer.color);
		}

		// render entities
		this._entities.forEach(function(e) {
			if (e && e.visible && !e._isDestroyed) {
				e.render();
			}
		});
	}
}

Screen.INSTANCE_COUNT = 0;

export default Screen;