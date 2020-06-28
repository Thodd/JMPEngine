import Manifest from "../assets/Manifest.js";
import Helper from "../utils/Helper.js";
import Collision from "./Collision.js";
import EntityTypeStore from "./EntityTypeStore.js";
import { error } from "../utils/Log.js";
import PIXI from "../utils/PIXIWrapper.js";

let INSTANCE_COUNT = 0;

/**
 * Screen class
 *
 * Below you find the lifecycle of the Screen class.
 * Please check the API documentation of all public functions to better understand what you can and should do
 * in these functions/hooks.
 *
 * [+] = public:            These functions can safely be overwriten
 * [-] = private:           <b>Don't overwrite these functions!</b>
 *
 * [+] constructor          (called once)                  -> game logic
 *
 * [-] _setup               (called every activation)      -> Buffer.reset(false), no screen clearing (see below)
 * [+] setup                (called every activation)      -> Setup Buffers, e.g. change render-mode
 * [-] _initialClear        (called every activation)      -> clear the Buffers, some might be excluded to to "autoclear=false"
 * [+] begin                (called every activation)      -> game logic, recurring things which need to be done before any other game logic
 *
 * [+] update               (called each frame)            -> update hook for the Screen (game logic)
 * [-] update entities      (called each frame)            -> update entities (game logic)
 * [+] render               (called each frame)            -> render hook for the Screen
 * [-] render entities      (called each frame)            -> render entities
 *
 * [+] end                  (called every deactivation)    -> game logic
 *
 * @public
 */
class Screen {
	constructor() {
		this._ID = INSTANCE_COUNT++;
		this._entities = [];
		this._toBeAdded = [];
		this._toBeRemoved = [];

		// @PIXI: create pixi render container to hold all sprites
		this._pixiContainer = new PIXI.Container();

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

	toString() {
		return `${this.constructor.name} (${this._ID})`;
	}

	/**
	 * Returns the width of the Screen as defined in the manifest.json.
	 * Equivalent to <code>Manifest.get("/w")</code>
	 * @public
	 */
	getWidth() {
		return this.width;
	}

	/**
	 * Returns the height of the Screen as defined in the manifest.json.
	 * Equivalent to <code>Manifest.get("/h")</code>
	 * @public
	 */
	getHeight() {
		return this.height;
	}

	/**
	 * Internal setup function.
	 * Resets all buffers back to the initial state.
	 * This is done so each Screen can start in a fresh GFX state.
	 * If the setup() hook is correctly implemented, the game implementation can set
	 * camera values, clear-colors etc. before the _initalClear().
	 */
	_setup() {}

	/**
	 * Setup Hook.
	 * Called at the very beginning of each Screen activation.
	 *
	 * Configuration of the managed GFX Buffer instances should be done here:
	 * - setting the clear-color
	 * - disabling the automatic clearing
	 * - changing the RenderMode
	 * - Fixing the camera to a static position
	 */
	setup() {}

	/**
	 * Clears the buffers initially.
	 * Called every Screen activation.
	 */
	_initialClear(){}

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
	 * Schedules the given entity for adding to the
	 * Screen at the end of the current frame.
	 */
	add(e) {
		// check if already scheduled for removal
		let isScheduled = e._isScheduledForAdding;

		if (!e._screen && !isScheduled && !e._isDestroyed) {
			if (e._isScheduledForRemoval) {
				Helper.remove(e, this._toBeRemoved);
				e._isScheduledForRemoval = false;
			}
			this._toBeAdded.push(e);
			e._isScheduledForAdding = true;

			// add to type mapping
			if (e._types) {
				this._entityTypeStore.add(e);
			}
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
		let isScheduled = e._isScheduledForRemoval;

		if (e._screen == this && !e._isScheduledForRemoval) {
			if (e._isScheduledForAdding) {
				Helper.remove(e, this._toBeAdded);
				e._isScheduledForAdding = false;
			}
			this._toBeRemoved.push(e);
			e._isScheduledForRemoval = true;
			if (e._types) {
				this._entityTypeStore.remove(e);
			}
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

	getEntities() {
		return this._entities;
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
	_update(dt) {
		// [1] call update hook before the entities are updated
		this.update(dt);

		// [2] update entities
		this._entities.forEach(function(e) {
			if (e && e.active && !e._isDestroyed) {
				e.update(dt);
			}
		});

		// Houskeeping (Safely adding & removing entities)

		// [3] add scheduled entities
		// we make a snapshot of the currently adding entities, so we can add additional once during the added() hook
		let curA = this._toBeAdded;
		let lenA = curA.length;
		this._toBeAdded = [];
		for (let i = 0; i < lenA; i++) {
			let ea = curA[i];
			this._entities.push(ea);
			ea._screen = this;

			// @PIXI: Add entity sprite from the container of the Screen
			this._pixiContainer.addChild(ea._pixiSprite);

			// call added hook if given
			if (ea.added) {
				ea.added();
			}
		}

		// [4] remove scheduled entities
		// Entities are removed at the end of the frame, so that they are removed before a Screen change.
		// we also make sure we can remove additional entities during the remove() hook
		let curR = this._toBeRemoved;
		let lenR = curR.length;
		this._toBeRemoved = [];
		for (let j = 0; j < lenR; j++) {
			let er = curR[j];
			Helper.remove(er, this._entities);
			er._screen = null;

			// @PIXI: remove entity's sprite from the container of the Screen
			this._pixiContainer.removeChild(er._pixiSprite);

			// call removed hook if given
			if (er.removed) {
				er.removed(this);
			}
		}
	}

	/**
	 * Update Hook.
	 * Overwrite this in your subclasses if needed.
	 * The Screen's update method is called before the entities of the Screen are updated.
	 */
	update() {}

	/**
	 * End Hook.
	 * Called every time the Screen is released as the currently shown <code>Engine.screen</code>.
	 * It is called one frame after another Screen was set to <code>Engine.screen</code>.
	 *
	 * The end hook is called on the "old" Screen <b>before</b> the begin hook of the newly set <code>Engine.screen</code>.
	 */
	end() {}
}

export default Screen;