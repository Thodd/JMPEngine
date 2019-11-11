import GFX from "../gfx/GFX.js";
import { warn, error, fail } from "../utils/Log.js";
import FrameCounter from "../utils/FrameCounter.js";
import Collision from "./Collision.js";

/**
 * Entity Constructor
 */
class Entity {
	constructor() {
		this._ID = Entity.INSTANCE_COUNT++;

		this._screen = null;

		this.active = true;
		this.visible = true;
		this._isDestroyed = false;

		// gfx
		this._spriteConfig = null;
		this.x = 0;
		this.y = 0;
		this.layer = 0;

		// collision
		this.hitbox = {
			x: 0,
			y: 0,
			w: 0,
			h: 0
		};

		/**
		 * The collision type.
		 * Once the Entity is added to a Screen, the Screen
		 * takes care of tracking all Entities and their types.
		 *
		 * Default is null, so we have no collision.
		 */
		this._types = null;
	}

	toString() {
		return `${this.constructor.name} (${this._ID})`;
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
	 * "Added" hook.
	 * Called everytime the entity is added to a World.
	 */
	added() {}

	/**
	 * "Removed" hook.
	 * Called everytime the entity is removed to a World.
	 */
	removed() {}

	/**
	 * Destroys the Entity.
	 * Entity is safely removed from the world.
	 *
	 * The "removed" hook always called afterwards!
	 */
	destroy() {
		this._screen.remove(this);
		this._isDestroyed = true;
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
	 * @param {Number} [x]
	 * @param {Number} [y]
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
	 * @param {object} config
	 */
	setSprite(config) {
		this._spriteConfig = Object.assign(config);

		// check if the new sprite def has animations
		// if not we asume a valid single sprite definition
		if (this._spriteConfig && this._spriteConfig.animations) {
			let animationsDef = this._spriteConfig.animations;
			if (!animationsDef.default) {
				error(`Sprite definition of ${this} does not contain a default animation!`);
			}

			// process new animations
			for (let animName in this._spriteConfig.animations) {
				if (animName != "default") {
					let anim = this._spriteConfig.animations[animName];
					// set processing values, e.g. FrameCounter
					anim.name = animName;
					anim.currentFrame = 0;
					anim.id = anim.frames[0]; // initially visible frame is 0

					// if no delay is given, we assume a the animation is a "freeze-frame", e.g. an idle-frame
					// so we don't need a delay-counter here to save some performance
					if (anim.delay != undefined) {
						anim.delayCounter = new FrameCounter(anim.delay);
					}
				}
			}

			// initialize default animation
			this.playAnimation({name: this._spriteConfig.animations.default});
		}
	}

	/**
	 * Plays an animation
	 * @param {object} config
	 */
	playAnimation(config) {
		// check if the new animation is already playing
		if (this._currentAnimation) {
			if (this._currentAnimation.name == config.name) {
				// if the reset flag is set, we reset the animation to frame 0
				// by default the animation keeps on playing
				if (config.reset) {
					this._currentAnimation.currentFrame = 0;
					// delay counter has to be reset too
					this._currentAnimation.delayCounter.reset();
				}
			}
		}

		// new animation definition
		this._currentAnimation = this._spriteConfig.animations[config.name];
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
			if (anim.delayCounter && anim.delayCounter.isReady()) {
				// advance frame counter
				anim.currentFrame++;
				if (anim.currentFrame >= anim.frames.length) {
					anim.currentFrame = 0;
				}
				// update sprite
				anim.id = anim.frames[anim.currentFrame];
			}
		}
	}

	/**
	 * Render hook.
	 * Called once after every update loop.
	 *
	 * IMPORTANT:
	 * To keep the default rendering behavior intact,
	 * call "super.render()" at the beginning of your custom render function.
	 */
	render() {
		// if animations are defined we advance the currently set one frame-by-frame
		this._updateCurrentAnimation();

		// only try to render if we have either an animation or a default sprite config
		if (this._currentAnimation || this._spriteConfig) {

			// three possibile render value locations with the following priority
			// 1. Animation, 2. Default Sprite, 3. None (empty object)
			let anim = this._currentAnimation || {};
			let defaultSprite = this._spriteConfig || {};

			// retrieve render values
			let sheet = anim.sheet || defaultSprite.sheet;
			let id = anim.id != undefined ? anim.id : defaultSprite.id; // might be 0!
			let offsetX = anim.offsetX != undefined ? anim.offsetX : defaultSprite.offsetX; // might be 0!
			let offsetY = anim.offsetY != undefined ? anim.offsetY : defaultSprite.offsetY; // might be 0!
			let color = anim.color || defaultSprite.color;

			var dx = this.x + (offsetX || 0);
			var dy = this.y + (offsetY || 0);

			// sheet, id, layer, x, y, w, h, color
			// width and height are undefined, because we want the default value from the actual sprite
			GFX.spr_ext(sheet, id, dx, dy, undefined, undefined, this.layer, color);
		}

		if (Entity.RENDER_HITBOXES) {
			GFX.px(this.x + this.hitbox.x, this.y + this.hitbox.y, "#FF0085", this.layer); // top left
			GFX.px(this.x + this.hitbox.x + this.hitbox.w - 1, this.y + this.hitbox.y, "#FF0085", this.layer); // top right
			GFX.px(this.x + this.hitbox.x, this.y + this.hitbox.y + this.hitbox.h - 1, "#FF0085", this.layer); // bottom left
			GFX.px(this.x + this.hitbox.x + this.hitbox.w - 1, this.y + this.hitbox.y + this.hitbox.h -1, "#FF0085", this.layer); // bottom right
		}
	}

}

Entity.RENDER_HITBOXES = false;

Entity.INSTANCE_COUNT = 0;

export default Entity;