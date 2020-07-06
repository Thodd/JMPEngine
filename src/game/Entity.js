import Spritesheets from "../assets/Spritesheets.js";
import { warn, fail } from "../utils/Log.js";
import FrameCounter from "../utils/FrameCounter.js";
import Collision from "./Collision.js";

import PIXI from "../core/PIXIWrapper.js";

let INSTANCE_COUNT = 0;

/**
 * Entity Constructor
 */
class Entity {
	constructor(x=0, y=0) {
		this.x = x;
		this.y = y;

		this._ID = INSTANCE_COUNT++;

		this._screen = null;

		// @PIXI
		this._pixiSprite = new PIXI.Sprite();

		// By default we set this sprite to invisible.
		// Not all Entities need to be rendered, some are just for updating.
		// Relevant entities will be made visible by configuring the sprite.
		this._pixiSprite.visible = false;

		// visibility mode for automatic culling
		this.autoVisibility = false;

		// screen internal information
		this._isScheduledForRemoval = false;
		this._isScheduledForAdding = false;

		// lifetime of an entity
		this.active = true;
		this._isDestroyed = false;

		// gfx
		this._spriteConfig = {
			offset: {
				x: 0,
				y: 0
			}
		};

		// by default we render on layer 0
		this.layer = 0;

		// collision hitbox, by default it's empty so the Entity does not collide with anything
		// the _gfx property holds the @PIXI.Graphics instance which is needed fir debug rendering.
		this._hitbox = {
			_gfx: null,
			x: 0,
			y: 0,
			w: 0,
			h: 0
		};

		/*
		 * The collision type.
		 * Once the Entity is added to a Screen, the Screen
		 * takes care of tracking all Entities and their types.
		 *
		 * Default is null, so we have no collision.
		 */
		this._types = null;

		/**
		 * Animation variables
		 */
		this._currentAnimation = null;
		this._animationTimer = new FrameCounter(0);
	}

	toString() {
		return `${this.constructor.name} (${this._ID})`;
	}

	getPixiSprite() {
		return this._pixiSprite;
	}

	/**
	 * Returns the Screen instance to which this Entity is added.
	 * If the Entity is not added to a Screen, <code>null</code> is returned.
	 */
	getScreen() {
		return this._screen;
	}

	setTypes(a) {
		if (!Array.isArray(a)) {
			fail("${this}: setType() only accepts an array of types strings!");
		}

		this._types = a;

		if (this._screen) {
			this._screen._updateTypes(this);
		}
	}

	getTypes() {
		return this._types;
	}

	/**
	 * Updates the Hitbox dimensions.
	 *
	 * Note, concerning debugging:
	 * If the debug option Entity.RENDER_HITBOX or this.RENDER_HITBOX is set, a PIXI.Graphics object is
	 * created for rendering the hitbox. Please keep this in mind with respect to render performance.
	 * @param {object} cfg Hitbox dimensions (x, y, w, h)
	 */
	updateHitbox(cfg) {
		this._hitbox.x = cfg.x || this._hitbox.x;
		this._hitbox.y = cfg.y || this._hitbox.y;
		this._hitbox.w = cfg.w || this._hitbox.w;
		this._hitbox.h = cfg.h || this._hitbox.h;

		let hbColor = this.RENDER_HITBOX || Entity.RENDER_HITBOX;
		if (hbColor) {
			// create a hitbox graphics object if needed or clear existing one
			if (!this._hitbox._gfx) {
				this._hitbox._gfx = new PIXI.Graphics();
			} else {
				this._hitbox._gfx.clear();
			}
			// x/y offset
			this._hitbox._gfx.x = this.x + this._hitbox.x;
			this._hitbox._gfx.y = this.y + this._hitbox.y;
			// draw filled rect + border
			this._hitbox._gfx.beginFill(hbColor, 0.3);
			this._hitbox._gfx.lineStyle(1, hbColor, 1);
			this._hitbox._gfx.drawRect(1, 0, this._hitbox.w-1, this._hitbox.h-1);
			this._hitbox._gfx.endFill();
		}
	}

	/**
	 * Destroys the Entity.
	 * Entity is safely removed from the world.
	 * The "removed" hook is always called afterwards.
	 *
	 * A destroyed Entity is unusable!
	 * Make sure to not reinsert it into the Screen again.
	 */
	destroy() {
		if (!this._isDestroyed) {
			// @PIXI: destroy pixi sprite
			this._pixiSprite.destroy(true);

			if (this._hitbox._gfx) {
				this._hitbox._gfx.destroy(true);
			}

			this._screen.remove(this);
			this._isDestroyed = true;
		}
	}

	/**
	 * Update hook.
	 * Called once every frame.
	 * Perform game logic here.
	 */
	update() {}

	/**
	 * Returns if this Entity instance collides with the Entity e
	 * when this instance is placed at an optional position (x/y).
	 *
	 * @param {Entity} e
	 * @param {Number} [x]
	 * @param {Number} [y]
	 * @returns {boolean} wether a collision is detected or not
	 */
	collidesWith(e, x, y) {
		return Collision.checkAtPosition(this, e, x || this.x, y || this.y);
	}

	/**
	 * Checks if this Entity instance collides with any other Entities of the given
	 * type list inside its current screen.
	 * All Entities inside the current screen will be checked for a collision.
	 *
	 * <b>Beware:</b>
	 * This kind of collision might become more expensive, the more entities of
	 * the given type exist.
	 *
	 * @param {string[]} types a list of all types which should be checked for collision
	 * @param {boolean} [returnAll] if set to true, all colliding entities are returned,
	 *      if set to false only the first one is returned.
	 *      Default is false.
	 * @param {Number} [x] x-coordinate at which the entity will be placed for a collision check
	 * @param {Number} [y] y-coordinate at which the entity will be placed for a collision check
	 * @returns {Entity|Entity[]|undefined} either: the first found colliding Entity,
	 *      or if returnAll is set to true: an array of all colliding Entities,
	 *      or if no collision was detected: undefined.
	 */
	collidesWithTypes(types, returnAll=false, x, y) {
		if (this._screen) {
			return this._screen._collidesWithType(this, types, returnAll, x || this.x, y || this.y);
		} else {
			warn("No collision check performed. The entity is not added to a Screen.");
		}
	}

	/**
	 * Sets a new sprite definition, including animations.
	 * The underlying PIXI sprite will configured according to this new sprite configuration.
	 * @param {object} config
	 */
	configSprite(config) {
		// we merge the new config with at least an empty offset object
		this._spriteConfig = Object.assign({
			offset: {x: 0, y: 0}
		}, config);

		// Figure out what the new texture should be
		let newTexture;

		if (config.sheet) {
			// sprite given via sheet
			let sheet = Spritesheets.getSheet(this._spriteConfig.sheet);

			if (!sheet) {
				fail(`Unknown sheet '${this._spriteConfig.sheet}'!`, "Entity");
			}

			// @PIXI: get texture from sheet
			newTexture = sheet.textures[0];
		} else if (config.texture) {
			// @PIXI: sprite given via texture
			newTexture = config.texture;
		} else if (config.replaceWith) {
			// @PIXI: also make sure to destroy the original sprite!
			// @PIXI-TODO: How does destroy work?
			// When replacing do we need to remove it from the stage?
			this._pixiSprite.destroy();

			// Also IMPORTANT: add "replaceWith" DisplayObject to the screen stage!

			// @PIXI: replace the original sprite with another PIXI.DisplayObject
			this._pixiSprite = config.replaceWith;
		}

		// @PIXI: set the default texture for the pixi sprite & make it visible
		// might be overwritten by an animation definition below
		if (newTexture) {
			this._pixiSprite.texture = newTexture;
			this._pixiSprite.visible = true;
		}


		// check if the new sprite def has animations
		// if not we asume a valid single sprite definition
		if (this._spriteConfig && this._spriteConfig.animations) {
			let animationsMap = this._spriteConfig.animations;

			// sanity checks
			if (!animationsMap.default) {
				fail(`Sprite definition of ${this} does not contain a default animation!`, "Entity");
			}
			if (!animationsMap[animationsMap.default]) {
				fail(`There is no 'default' animation of name '${animationsMap.default}', ${this}!`, "Entity");
			}

			// process new animations
			for (let animName in animationsMap) {
				// we skip the "default" definition here, since it's just the name of another animation
				if (animName != "default") {
					let anim = animationsMap[animName];

					if (!anim.sheet && !this._spriteConfig.sheet) {
						fail(`No spritesheet specified for ${this} or its animation of name '${animName}'!`, "Entity");
					}

					// set default processing values
					anim.name = animName;
					anim.currentFrame = 0;
					anim.id = anim.frames[0]; // initially visible frame is 0
					anim.dt = anim.dt || 0;

					// if no delay is given, we assume a the animation is a "freeze-frame", e.g. an idle-frame
					//anim.delayCounter = new FrameCounter(anim.dt);
					this._animationTimer.setMaxFrames(anim.dt);
				}
			}

			// initialize default animation
			this.playAnimation({name: animationsMap.default});
		}
	}

	/**
	 * Plays an animation
	 * @param {object} config
	 */
	playAnimation(config) {
		// new animation definition
		this._currentAnimation = this._spriteConfig.animations[config.name];

		if (this._currentAnimation) {
			// register new handlers if given
			this._currentAnimation.done = config.done;
			this._currentAnimation.change = config.change;

			if (this._currentAnimation && config.reset) {
				this._currentAnimation.currentFrame = 0;

				// frameData can be an object or a number
				let frameData = this._currentAnimation.frames[0];
				this._currentAnimation.id = frameData.id != undefined ? frameData.id : frameData;

				// delay counter has to be reset too
				// this happens by setting its max-frames to the dt value defined in either the frame-data or the animation definition
				this._animationTimer.setMaxFrames(frameData.dt || this._currentAnimation.dt);
			}
		} else {
			fail(`Cannot play unknown animation '${config.name}'`, "Entity");
		}
	}

	/**
	 * Advances the currently set animation if the frame-delay was reached
	 */
	_updateCurrentAnimation() {
		let anim = this._currentAnimation;
		if (anim) {
			// animation frame only needs to be updated if a delay-counter was defined
			// if an animation has NO delay set, we asume it is not animated at all
			// a delay of 0 is valid, since it means the frame is advanced every Engine render frame!
			if (this._animationTimer.isReady()) {
				// advance frame counter
				anim.currentFrame++;
				if (anim.currentFrame >= anim.frames.length) {
					anim.currentFrame = 0;
					if (this._currentAnimation.done) {
						this._currentAnimation.done();
					}
				} else {
					if (this._currentAnimation.change) {
						this._currentAnimation.change();
					}
				}

				// change animation id and rest the frame-counter to the next frame dt (if defined)
				let frameData = anim.frames[anim.currentFrame];
				anim.id = frameData.id != undefined ? frameData.id : frameData;
				this._animationTimer.setMaxFrames(frameData.dt || anim.dt);
			}

			// IMPORTANT:
			// We again retrieve the currently set animation here,
			// because the done() callback might have changed the animation!
			// Otherwise we might show the first key-frame of a now outdated animation for one frame
			anim = this._currentAnimation;

			// @PIXI: update texture based on current key-frame, we made sure a sheet exists upon animation definition
			let sheetObj = Spritesheets.getSheet(anim.sheet || this._spriteConfig.sheet);
			this._pixiSprite.texture = sheetObj.textures[anim.id];
		}
	}

	/**
	 * Checks if the entity is inside the view with respect to its defined sprite.
	 *
	 * @param {integer} the tolerance aroung the camera borders
	 */
	isInView(tolerance) {
		if (this._screen) {
			this._screen.isEntityInView(this, tolerance);
		}
	}

}

Entity.RENDER_HITBOXES = false;

export default Entity;