import ArrayHelper from "../utils/ArrayHelper.js";
import GFX from "../gfx/GFX.js";
import Collision from "./Collision.js";
import EntityTypeStore from "./EntityTypeStore.js";
import { error } from "../utils/Log.js";

/**
 * Layer class
 * @public
 */
class Layer {
	constructor(i) {
		this.i = i;
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
		this._ID = Screen.INSTANCE_COUNT++;
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
	}

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
		return result;
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
		// 1. move (translate) camera and
		// 2. clear layers
		for (let i = 0; i < this._layers.length; i++) {
			let layer = this._layers[i];
			//GFX.save(i);
			// translate camera
			if (!layer.fixedCam) {
				GFX.trans(i, -this.cam.x, -this.cam.y);
			}
			GFX.clear_rect(i, layer.clearColor, this.cam.x, this.cam.y);
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

Screen.INSTANCE_COUNT = 0;

export default Screen;