import Manifest from "../Manifest.js";
import Helper from "../utils/Helper.js";
import GFX from "../gfx/GFX.js";
import Collision from "./Collision.js";
import EntityTypeStore from "./EntityTypeStore.js";
import { error } from "../utils/Log.js";

let INSTANCE_COUNT = 0;

/*
Screen lifecycle
[+] = public
[-] = private

	[+] constructor    (called once)                  -> game logic
	[-] _setup         (called every activation)      -> Buffer.reset(), no screen clearing
	[+] setup          (called every activation)      -> Setup Buffers, e.g. change render-mode
	[-] _initialClear  (called every activation)      -> clear the Buffers, some might be excluded to to "autoclear=false"
	[+] begin          (called every activation)      -> game logic
	[+] update         (called each frame)            -> update hook for the Screen (game logic)
		[-]            (called each frame)            -> update entities (game logic)
	[+] render         (called each frame)            -> render hook for the Screen
		[-]            (called each frame)            -> render entities
	[+] end            (called every deactivation)    -> game logic
*/


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
		this._layers = Manifest.get("/layers");

		// dimensions
		this.width = Manifest.get("/w");
		this.height = Manifest.get("/h");

		// the public camera interface
		let _camX = 0;
		let _camY = 0;

		/**
		 * The camera of the screen.
		 * Change the x/y coordinates to move the camera around.
		 * During rendering this will be respected for correctly shifting entities around.
		 */
		this.cam = {
			set x (x) {
				_camX = x * -1;
			},
			get x() {
				return -1 * _camX;
			},
			set y (y) {
				_camY = y * -1;
			},
			get y() {
				return -1 * _camY;
			}
		};

		this._entityTypeStore = new EntityTypeStore();
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

	/**
	 * Internal begin hook takes care of clean-up like layer clearing etc.
	 */
	_begin(){
		// initially clear all layers so we don't have any leftover graphics from a previous Screen.
		for (let i = 0; i < this._layers; i++) {
			GFX.get(i).clear();
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
	 * Schedules the given entity for adding to the
	 * Screen at the end of the current frame.
	 */
	add(e) {
		// check if already scheduled for removal
		let isScheduled = Helper.contains(e, this._toBeAdded);

		if (!e._screen && !isScheduled && !e._isDestroyed) {
			Helper.remove(e, this._toBeRemoved);
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
		let isScheduled = Helper.contains(e, this._toBeRemoved);

		if (e._screen == this && !isScheduled) {
			Helper.remove(e, this._toBeAdded);
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

	/**
	 * Internal update method.
	 * Updates the Screen itself and then the entities added to the Screen.
	 */
	_update() {
		// [1] call update hook before the entities are updated
		this.update();

		// [2] update entities
		this._entities.forEach(function(e) {
			if (e && e.active && !e._isDestroyed) {
				e.update();
			}
		});

		// Houskeeping (Safely adding & removing entities)
		// [3] add scheduled entities
		let lenA = this._toBeAdded.length;
		for (let i = 0; i < lenA; i++) {
			let ea = this._toBeAdded[i];
			this._entities.push(ea);
			ea._screen = this;
			ea.added();
		}
		this._toBeAdded = [];

		// [5] remove scheduled entities
		let lenR = this._toBeRemoved.length;
		for (let j = 0; j < lenR; j++) {
			let er = this._toBeRemoved[j];
			Helper.remove(er, this._entities);
			er._screen = null;
			er.removed();
		}
		this._toBeRemoved = [];
	}

	/**
	 * Update Hook.
	 * Overwrite this in your subclasses if needed.
	 * The Screen's update method is called before the entities of the Screen are updated.
	 */
	update() {}

	/**
	 * Internal render method.
	 */
	_render() {
		// [1] move (translate) camera and
		// [2] clear layers
		for (let i = 0; i < this._layers; i++) {
			let buffer = GFX.getBuffer(i);

			// push Screen camera state to the Buffers
			if (!buffer.isCameraFixed()) {
				buffer.cam(-this.cam.x, -this.cam.y);
			}

			if (buffer.isAutoCleared()) {
				GFX.get(i).clear();
			}
		}

		// [3] call render hook before the entities are rendered
		this.render();

		// [4] render entities
		this._entities.forEach(function(e) {
			if (e && e.visible && !e._isDestroyed) {
				e.render();
			}
		});

		// [5] flush buffer of each layer
		for (let i = 0; i < this._layers; i++) {
			// flush buffers: only has effect for buffers with GFX.RenderModes.RAW
			GFX.get(i).flush();
		}
	}

	/**
	 * Render Hook.
	 * Overwrite this in your subclasses if needed.
	 * The Screen's render method is called before the entities of the Screen are rendered.
	 */
	render() {}
}

export default Screen;