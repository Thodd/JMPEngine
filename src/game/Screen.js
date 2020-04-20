import ArrayHelper from "../utils/ArrayHelper.js";
import GFX from "../gfx/GFX.js";
import Collision from "./Collision.js";
import EntityTypeStore from "./EntityTypeStore.js";
import { error } from "../utils/Log.js";

let INSTANCE_COUNT = 0;

/**
 * Layer class
 * @public
 */
class Layer {
	constructor(i) {
		this.i = i;
		this.autoClear = true;
		/**
		 * The color which will be used to clear the layer before rendering
		 * any entities.
		 */
		this.clearColor = "transparent";
		/**
		 * Marks if the camera should be fixed for this layer.
		 * Useful for UI elements.
		 */
		this.fixedCam = false
	}
}

/**
 * Screen class
 * @public
 */
class Screen {
	constructor() {
		this._ID = INSTANCE_COUNT++;
		this._entities = [];
		this._toBeAdded = [];
		this._toBeRemoved = [];

		// create layers
		this._layers = [];
		for (let i = 0; i < GFX.canvases.length; i++) {
			this._layers.push(new Layer(i));
		}

		// the public camera interface
		let _camX = 0;
		let _camY = 0;

		/**
		 * The camera of the screen.
		 * Change the x/y coordinates to move the camera around.
		 * During rendering this will be respected for correctly shifting entities around.
		 */
		this.cam = {
			set x (iXValue) {
				_camX = iXValue * -1;
			},
			get x() {
				return -1 * _camX;
			},
			set y (iYValue) {
				_camY = iYValue * -1;
			},
			get y() {
				return -1 * _camY;
			}
		};

		this._entityTypeStore = new EntityTypeStore();

		// lowest layer is cleared by default with black
		this.getLayers(0).clearColor = "#222222";
	}

	/**
	 * Begin Hook.
	 * Called every time the Screen is activated as the currently shown <code>Engine.screen</code>.
	 * The begin() hook is called before update() and render().
	 * It is called one frame after the Screen was set to <code>Engine.screen</code>.
	 *
	 * The begin hook is called <b>after</b> the end hook of the last <code>Engine.screen</code> was called.
	 */
	begin() {}

	// internal begin hook takes care of clean-up like layer clearing etc.
	_begin(){
		// initially clear all layers so we don't have any leftover graphics from a previous Screen.
		for (let i = 0; i < this._layers.length; i++) {
			GFX.clear(i, this._layers[i].clearColor);
		}
	}

	/**
	 * End Hook.
	 * Called every time the Screen is released as the currently shown <code>Engine.screen</code>.
	 * It is called one frame after another Screen was set to <code>Engine.screen</code>.
	 *
	 * The end hook is called <b>before</b> the begin hook of the new <code>Engine.screen</code>.
	 */
	end() {}

	toString() {
		return `${this.constructor.name} (${this._ID})`;
	}

	/**
	 * Returns the layer with the given position.
	 * If no position is given, an array with all layers are returned.
	 * @param {int|undefined} i The layer position
	 * @returns {Layer} the chosen layer
	 */
	getLayers(i) {
		if (i == null) {
			return this._layers;
		}
		return this._layers[i];
	}

	/**
	 * Schedules the given entity for adding to the
	 * Screen at the end of the current frame.
	 */
	add(e) {
		// check if already scheduled for removal
		var isScheduled = ArrayHelper.contains(e, this._toBeAdded);

		if (!e._screen && !isScheduled && !e._isDestroyed) {
			ArrayHelper.remove(e, this._toBeRemoved);
			this._toBeAdded.push(e);

			this._entityTypeStore.add(e);
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
		// check if already scheduled for adding
		var isScheduled = ArrayHelper.contains(e, this._toBeRemoved);

		if (e._screen == this && !isScheduled) {
			ArrayHelper.remove(e, this._toBeAdded);
			this._toBeRemoved.push(e);

			this._entityTypeStore.remove(e);
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

	/**
	 * Updates the given Entitys collision types in the EntityTypeStore.
	 * @param {Entity} e
	 */
	_updateTypes(e) {
		this._entityTypeStore.remove(e);
		this._entityTypeStore.add(e);
	}

	/**
	 * Checks if the given Entity collides with any other Entity of the given types.
	 * @param {Entity} e
	 * @param {string[]} types
	 * @param {boolean} returnAll
	 * @param {Number} x
	 * @param {Number} y
	 */
	_collidesWithType(e, types, returnAll, x, y) {
		let result = [];

		// iterate all types that need to be checked
		for (let i = 0; i < types.length; i++) {
			let t = types[i];
			let entitySet = this._entityTypeStore.getEntitySet(t);

			// if we have an entity set for the given type we iterate it too
			if (entitySet) {
				let entries = [...entitySet];
				for (let j = 0; j < entries.length; j++) {
					let e2 = entries[j];
					if (Collision.checkAtPosition(e, e2, x, y)) {
						if (returnAll) {
							result.push(e2);
						} else {
							return e2;
						}
					}
				}
			}
		}

		if (returnAll) {
			return result; // result array
		} else {
			return undefined; // no collision found
		}
	}

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
		// 1. move (translate) camera and
		// 2. clear layers
		for (let i = 0; i < this._layers.length; i++) {
			let layer = this._layers[i];
			//GFX.save(i);
			// translate camera
			if (!layer.fixedCam) {
				GFX.trans(i, -this.cam.x, -this.cam.y);
			}
			if (layer.autoClear) {
				GFX.clear_rect(i, layer.clearColor, this.cam.x, this.cam.y);
			}
		}

		// render entities
		this._entities.forEach(function(e) {
			if (e && e.visible && !e._isDestroyed) {
				e.render();
			}
		});

		// move camera back after entity rendering
		for (let i in this._layers) {
			//GFX.restore(i);
			let layer = this._layers[i];
			if (!layer.fixedCam) {
				GFX.trans(i, +this.cam.x, +this.cam.y);
			}
		}
	}
}

export default Screen;