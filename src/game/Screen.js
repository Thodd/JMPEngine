import Manifest from "../assets/Manifest.js";
import Helper from "../utils/Helper.js";
import Collision from "./Collision.js";
import EntityTypeStore from "./EntityTypeStore.js";
import { error, fail } from "../utils/Log.js";

import PIXI from "../core/PIXIWrapper.js";

let INSTANCE_COUNT = 0;

let FRAME_EVENT_ID = 0;

/**
 * Screen class
 *
 * Below you find the lifecycle of the Screen class.
 * Please check the API documentation of all public functions to better understand what you can and should do
 * in these functions/hooks.
 *
 * [+] = public:               These functions can safely be overwriten
 * [-] = private:              <b>Don't overwrite these functions!</b>
 *
 * [+] constructor             (called once)                  -> Initial creation. Don't do game logic here, just create dependet entities etc.
 *
 * [+] setup                   (called every activation)      -> General setup hook
 * [+] begin                   (called every activation)      -> game logic, recurring things which need to be done before any other game logic
 *
 * [+] update                  (called each frame)            -> update hook for the Screen (game logic)
 * [-] process frame-events    (called each frame)            -> process the scheduled frame-events
 * [-] update entities         (called each frame)            -> update entities (game logic)
 * [+] endOfFrame update       (called each frame)            -> 2nd update  for the Screen AFTER all entities have been updated (game logic)
 *
 * [+] end                     (called every deactivation)    -> game logic
 *
 * @public
 */
class Screen {
	constructor() {
		this._ID = INSTANCE_COUNT++;
		this._entities = [];
		this._toBeAdded = [];
		this._toBeRemoved = [];
		this._layerChanges = [];
		this._frameEvents = [];

		// @PIXI: create pixi render container to hold all sprites
		this._pixiContainer = new PIXI.Container();

		// track dimensions for easier access
		this.width = Manifest.get("/w");
		this.height = Manifest.get("/h");

		// @PIXI: create multiple "layers" by defining PIXI.Containers
		// the developer can decide how many layers are needed
		// this allows for performant layer changes for entities
		// more complex layering use cases need to be addressed directly on PIXI level
		this._layers = [];
		let l = Manifest.get("/layers"); // defaults to 5
		for (let i = 0; i < l; i++) {
			let pixiLayer = new PIXI.Container();
			this._pixiContainer.addChild(pixiLayer);
			this._layers.push(pixiLayer);
		}

		// data object for storing layer information
		this._layerInfo = {};

		// @PIXI: One additional layer for debugging (unusable by the game itself)
		this._debugLayer = new PIXI.Container();
		this._pixiContainer.addChild(this._debugLayer);

		/**
		 * The camera of the screen.
		 * Change the x/y coordinates to move the camera around.
		 * During rendering this will be respected for correctly shifting entities around.
		 */
		this.cam = {
			/**
			 * Globally activate the camera system (default).
			 * Affects all layers.
			 */
			activate() {
				this._active = true;
			},
			/**
			 * Globally deactivate the camera system.
			 * Affects all layers.
			 */
			deactivate() {
				this._active = false;
			},
			x: 0,
			y: 0
		};
		this.cam.activate();

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
	 * Sets whether the camera should be fixed for the given layer.
	 * Layers with a fixed camera are not subject to a position change of the Screens camera.
	 * This is useful for HUDs etc.
	 *
	 * @param {integer} i Layer index
	 * @param {boolean} b whether the camera should be fixed or not
	 */
	setCameraFixedForLayer(i, b) {
		this._layerInfo[i] = this._layerInfo[i] || {};
		this._layerInfo[i].fixedCamera = b;
	}

	/**
	 * Setup Hook.
	 * Called at the very beginning of each Screen activation.
	 *
	 * General game-logic independent configuration should be done here:
	 * - setting the clear-color
	 * - creating UI elements
	 * - Fixing the camera of a layer
	 */
	setup() {}

	/**
	 * Begin Hook.
	 * Called every time the Screen is activated as the currently shown <code>Engine.screen</code>.
	 * The begin() hook is called before update().
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
			// if the entity is scheduled for removal we just revert this change
			// nothing to do further in this case
			if (e._isScheduledForRemoval) {
				Helper.remove(e, this._toBeRemoved);
				e._isScheduledForRemoval = false;
			} else {
				// actually add a new entity
				this._toBeAdded.push(e);
				e._isScheduledForAdding = true;
			}

			e._screen = this;

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

		if (e._screen == this && !isScheduled) {
			// if the entity is scheduled for adding we just revert this change
			// nothing to do further in this case
			if (e._isScheduledForAdding) {
				Helper.remove(e, this._toBeAdded);
				e._isScheduledForAdding = false;
			} else {
				// actually remove the entity
				this._toBeRemoved.push(e);
				e._isScheduledForRemoval = true;
			}

			e._screen = null;

			if (e._types) {
				this._entityTypeStore.remove(e);
			}
		} else {
			if (e._screen != this) {
				error(`Entity already added to another Screen: ${e._screen}!`);
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
	_updateTypes(e, oldTypes) {
		this._entityTypeStore.remove(e, oldTypes);
		this._entityTypeStore.add(e);
	}

	/**
	 * Changes the layer of the given entity instance from the given old to the new layer.
	 *
	 * @param {Entity} e the entity for which the layer will be changed
	 * @param {integer} newLayer
	 */
	_changeLayer(e, newLayer) {
		let nl = this._layers[newLayer];

		if (!nl) {
			fail(`Layer change to '${newLayer}' not possible. The game is initialized with layers 0 to ${this._layers.length-1}!`, this);
		}

		nl.addChild(e._pixiSprite);
	}

	/**
	 * Checks if the given Entity collides with any other Entity of the given types.
	 * @param {Entity} e
	 * @param {string[]} types
	 * @param {boolean} returnAll if set to true, all colliding entities are returned,
	 *                            if set to false only the first one is returned.
	 *                            Default is false.
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
					// only perform check for collidable entities
					// we can save some function calls this way, which is relevant for a big amount of entities
					if (e2._hitbox._collidable) {
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
		}

		if (returnAll) {
			return result; // result array
		} else {
			return undefined; // no collision found
		}
	}

	/**
	 * Checks if the given entity is visually(!) inside the view of the camera.
	 * Hitboxes are not checked!
	 *
	 * Should be enough for most use-cases and is internally used to mark entities outside the view
	 * as visible=false before rendering.
	 *
	 * @param {*} e
	 * @param {*} tolerance
	 */
	isEntityInView(e, /* tolerance */) {
		// TODO: implement tolerance for containment check

		let gfx;

		// @PIXI: Sanity check for sprites
		if (e._pixiSprite.isSprite) {
			// for PIXI.Sprite instances we need to check if the texture is valid
			gfx = e._pixiSprite.texture && e._pixiSprite.texture.valid ? e._pixiSprite.texture : undefined;
		} else {
			// we assume that the developer has replaced the original default PIXI.Sprite
			// with a valid renderable PIXI.DisplayObject, e.g. a PIXI.Graphics instance
			gfx = e._pixiSprite;
		}

		if (gfx) {
			// @PIXI: we now try to figure out what the actual render dimensions are inside the world coordinate system
			// with respect to the anchor point and sprite offsets
			// Important: not all PIXI.DisplayObject subclasses have an anchor, so we default to 0, e.g. PIXI.Graphics.
			let anchorX = e._pixiSprite.anchor && e._pixiSprite.anchor.x || 0;
			let anchorY = e._pixiSprite.anchor && e._pixiSprite.anchor.y || 0;

			let w1 = gfx.width;
			let h1 = gfx.height;
			// we shift the world x/y by the defined offset
			// additionally we have to substract the anchor x/y times the width or height
			let x1 = (e.x + e._spriteConfig.offset.x) - anchorX * w1;
			let y1 = (e.y + e._spriteConfig.offset.y) - anchorY * h1;

			// Screen dimensions
			let x2 = this.cam.x;
			let y2 = this.cam.y;
			let w2 = this.width;
			let h2 = this.height;

			// check if sprite is in view
			// While the calculation has some overhead it still reduces the number of draw calls.
			// With a lot of Entities this is significantly faster than "drawing" offscreen sprites.
			if (x1 < x2 + w2 &&
				x1 + w1 > x2 &&
				y1 < y2 + h2 &&
				y1 + h1 > y2) {
					return true;
			}
		}

		// no overlap or no texture
		return false;
	}

	/**
	 * Internal helper function to create a frame-event information object.
	 * @param {function} fn callback to be invoked once the frame-limit is reached
	 * @param {int} limit frame limit
	 * @returns {object} the frame-event object
	 * @private
	 */
	_createFrameEvent(fn, limit) {
		return {
			// IDs are pre-incremented to avoid 0.
			// game logic might check for "!id", to not create 2 intervals accidentally
			id: ++FRAME_EVENT_ID,
			fn: fn,
			frameCount: 0,
			frameLimit: limit,
			resolved: false
		};
	}

	/**
	 * Registers a one-time frame-event.
	 * The given callback is called after the given amount of frames have passed.
	 * Similar to JavaScript's setTimeout() function, but based on the Engine's framecount
	 * instead of milliseconds.
	 *
	 * @param {function} fn callback to be called after the given number of frames have passed
	 * @param {int} limit number of frames before the given callback is called
	 * @returns {int} frameEvent-id, used to cancel a callback before it was called
	 * @public
	 */
	registerFrameEvent(fn, limit) {
		let feInfo = this._createFrameEvent(fn, limit);
		feInfo.once = true;
		this._frameEvents.push(feInfo);
		return feInfo.id;
	}

	/**
	 * Registers an infinitely repeating frame-event.
	 * The given callback is called after the given amount of frames have passed.
	 * Similar to JavaScript's setInterval() function, but based on the Engine's framecount
	 * instead of milliseconds.
	 *
	 * @param {function} fn callback to be called after the given number of frames have passed
	 * @param {int} limit number of frames before the given callback is called
	 * @returns {int} frameEvent-id, used to cancel a callback before its next call
	 * @public
	 */
	registerFrameEventInterval(fn, limit) {
		let feInfo = this._createFrameEvent(fn, limit);
		this._frameEvents.push(feInfo);
		return feInfo.id;
	}

	/**
	 * Cancels the frame-event with the given ID.
	 * @param {int} id the frameEvent-id to cancel
	 * @public
	 */
	cancelFrameEvent(id) {
		for (let i = 0; i < this._frameEvents.length; i++) {
			let fe = this._frameEvents[i];
			if (fe.id == id) {
				fe.resolved = true;
				this._frameEvents._isDirty = true;
				return; // exit
			}
		}
	}

	/**
	 * Internal update method.
	 * Updates the Screen itself and then the entities.
	 */
	_update(dt) {
		// Phase [1]: Screen update hook (game logic)
		this.update(dt);

		// Phase [2]: Process timeouts and intervals
		let feLength = this._frameEvents.length;
		for (let i = 0; i < feLength; i++) {
			let fe = this._frameEvents[i];
			if (fe && !fe.resolved) {
				// count the frames for each frame-event
				fe.frameCount++;
				if (fe.frameCount > fe.frameLimit) {
					// invoke callback once the frame-event limit is reached
					fe.fn();

					// one-time frame-events are resolved, intervals reset their frameCount
					if (fe.once) {
						fe.resolved = true;
						// mark the frame-events list as dirty for house-keeping at the end of the frame
						this._frameEvents._isDirty = true;
					} else {
						fe.frameCount = 0;
					}
				}
			}
		}

		// Phase [3]: update entities (game logic)
		let len = this._entities.length;

		for (let i = 0; i < len; i++) {
			let e = this._entities[i];

			// Updating the animation is technically a rendering information, yet we do this at the beginning of the frame during the update loop.
			// If we would do it at the end of the frame, one might change the animation during the update step and "lose" a frame
			// on the defined frame delay, as the current frame would be counted too.
			if (e._currentAnimation) {
				e._updateCurrentAnimation();
			}

			// only entities which are set to active=true and which are not destroyed or scheduled for removal are updated!
			if (e && e.update && e.active && !e._isDestroyed && !e._isScheduledForRemoval) {
				e.update(dt);
			}
		}

		// Phase [4]: End of frame update (game logic)
		this.endOfFrame();

		// Phase [5]: Housekeeping (internal)
		this._houseKeeping();

		// Phase [6]: Updating rendering information (interal)
		this._updateRenderInfos();
	}

	/**
	 * Clean up and house keeping of Screen lifecycle information.
	 *   1. Safely adds and removes entities after the logic update loop
	 *   2. Clear completed frame-events
	 */
	_houseKeeping() {
		// add scheduled entities
		// we make a snapshot of the currently adding entities,
		// so we can schedule additional entities during the added() hook and they get added at the beginning of the next frame
		let curA = this._toBeAdded;
		let lenA = curA.length;
		this._toBeAdded = [];
		for (let i = 0; i < lenA; i++) {
			let ea = curA[i];

			// reset scheduling flags
			ea._isScheduledForAdding = false;
			ea._isScheduledForRemoval = false;

			this._entities.push(ea);
			//ea._screen = this;

			// @PIXI: Add entity sprite from the container of the Screen (in case it was not already added)
			let layer = this._layers[ea.layer];
			if (!layer) {
				fail(`Layer '${ea.layer}' does not exist :(\nThe game is initialized with layers 0 to ${this._layers.length-1}!`, this);
			} else {
				layer.addChild(ea._pixiSprite);
			}

			// call added hook if given
			if (ea.added) {
				ea.added();
			}
		}

		// remove scheduled entities
		// Entities are removed after the logic-updates but before the render-updates,
		// this way we can already exclude removed entities from the rendering.
		// Additionally we can make sure these entities are already removed before a Screen change.
		// we also make sure we can remove additional entities during the remove() hook
		let curR = this._toBeRemoved;
		let lenR = curR.length;
		this._toBeRemoved = [];
		for (let j = 0; j < lenR; j++) {
			let er = curR[j];

			// reset scheduling flags
			er._isScheduledForAdding = false;
			er._isScheduledForRemoval = false;

			Helper.remove(er, this._entities);
			//er._screen = null;

			// @PIXI: remove entity's sprite from the container of the Screen
			let layer = this._layers[er.layer];
			if (!layer) {
				fail(`Layer '${er.layer}' does not exist :(\nThe game is initialized with layers 0 to ${this._layers.length-1}!`, this);
			} else {
				layer.removeChild(er._pixiSprite);
			}

			// call removed hook if given
			if (er.removed) {
				er.removed(this);
			}
		}

		// clean-up frame-events completed or canceled frame
		if (this._frameEvents._isDirty) {
			this._frameEvents = this._frameEvents.filter(function(fe) {
				return !fe.resolved;
			});
			this._frameEvents._isDirty = false;
		}
	}

	/**
	 * Rendering Updates based on the current camera position and other stuff
	 * We do this after the logic-update loop and the house-keeping, because:
	 *   - only then can we be sure that the Entity's x/y is final
	 *   - added entities are correctly positioned    [and]    removed entities are completely ignored
	 *
	 * Sadly we cannot circumvent this second loop, however it runs without much impact for 10000+ entities.
	 * And it scales linearly, so...
	 */
	_updateRenderInfos() {
		// get new entities count, might be lesser or greater than the starting count
		let len = this._entities.length;

		// check if camera is active in general
		let camX = this.cam._active ? this.cam.x : 0;
		let camY = this.cam._active ? this.cam.y : 0;

		// track the # of visible entities for debugging
		this._entitiesVisible = 0;

		for (let i = 0; i < len; i++) {
			let e = this._entities[i];

			if (e._hitbox._gfx) {
				// the visibility of the hitbox depends on the "collidability" of the entity itself
				e._hitbox._gfx.visible = e._hitbox._collidable;

				// Debugging: add hitbox to the pixi container if defined (and not yet added)
				// (topmost debug layer, so they are always visible!)
				if (!e._hitbox._gfx.parent) {
					this._debugLayer.addChild(e._hitbox._gfx);
				}
			}

			// automatic culling: Only if it's turned on.
			if (e.autoVisibility) {
				let entityInsideView = this.isEntityInView(e);
				e._pixiSprite.visible = entityInsideView;
				if (e._hitbox._gfx) { // also hide/show hitbox
					e._hitbox._gfx.visible = entityInsideView;
				}
				this._entitiesVisible += +entityInsideView;
			} else {
				this._entitiesVisible += +e._pixiSprite.visible;
			}

			// TODO: deactivate entity outside view?
			// e.activationRadius = 10  -->  active inside  camera + 10px  all around

			// @PIXI: we shift the render position for all PIXI.Sprite/PIXI.DisplayObjects
			// this is nothing PIXI can do out of the box, at least not easily in a pixel-perfect manner...
			if (e._isTilemap) {
				// Tilemaps have their own sprite replacement logic and are always stuck to the camera
				e._updateRenderInfos();
			} else {
				// check if the entity is on a layer with a fixed camera
				let cameraFixed = this._layerInfo[e.layer] && this._layerInfo[e.layer].fixedCamera;
				let cx = !cameraFixed ? camX : 0;
				let cy = !cameraFixed ? camY : 0;

				// Read the animation offset from the currently applied animation frame (if any)
				let aX = 0;
				let aY = 0;
				if (e._currentAnimation) {
					let defaultAnimOffset = e._currentAnimation.offset;
					let frameDef = e._currentAnimation.frames[e._currentAnimation.currentFrame];
					if (frameDef.offset) {
						aX = frameDef.offset.x;
						aY = frameDef.offset.y;
					}
					aX = aX || defaultAnimOffset.x || 0;
					aY = aY || defaultAnimOffset.y || 0;
				}

				// shift normal entities
				// the offsets are relative to eachother, animation offsets are based on the base-sprite offset
				e._pixiSprite.x = e.x + e._spriteConfig.offset.x + aX - cx;
				e._pixiSprite.y = e.y + e._spriteConfig.offset.y + aY - cy;

				// Debugging: if a hitbox is defined we also move it along with the camera
				if (e._hitbox._gfx) {
					e._hitbox._gfx.x = e.x + e._hitbox.x - cx;
					e._hitbox._gfx.y = e.y + e._hitbox.y - cy;
				}

				// FINALLY: If forward the render info update if needed
				if (e._updateRenderInfos) {
					e._updateRenderInfos();
				}
			}
		}
	}

	/**
	 * Update hook.
	 * Overwrite this in your subclasses if needed.
	 * The Screen's update method is called before the entities of the Screen are updated.
	 */
	update() {}

	/**
	 * End of frame update hook.
	 * Overwrite this in your subclasses if needed.
	 * The endOfFrame method is called after all entities of the Screen have been updated.
	 * This is a good place to update the camera position, e.g. if you want the camera to follow the player.
	 */
	endOfFrame() {}

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