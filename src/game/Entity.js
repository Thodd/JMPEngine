import { warn, fail } from "../utils/Log.js";
import { DEG_2_RAD } from "../utils/M4th.js";
import Spritesheets from "../assets/Spritesheets.js";
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

		// track the original starting position of the Entity
		this._startX = null;
		this._startY = null;
		this.startX = this.x;
		this.startY = this.y;

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
		this._layer = 0;

		// collision hitbox, by default it's empty so the Entity does not collide with anything
		// the _gfx property holds the @PIXI.Graphics instance which is needed fir debug rendering.
		this._hitbox = {
			_gfx: null,
			_collidable: false,
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

	set visible(v) {
		if (this._pixiSprite) {
			this._pixiSprite.visible = v;
			// deactivate autovisibility if it's set explicitly!
			this.autoVisibility = false;
		}
	}

	get visible() {
		if (this._pixiSprite) {
			return this._pixiSprite.visible;
		}
	}

	set alpha(a) {
		if (this._pixiSprite) {
			this._pixiSprite.alpha = a != undefined ? a : 1;
		}
	}

	get alpha() {
		if (this._pixiSprite) {
			return this._pixiSprite.alpha;
		}
		return 1;
	}

	set startX(v) {
		if (this._startX == null) {
			this._startX = v;
		} else {
			warn("The starting coordinates of an Entity are immutable!", "Entity");
		}
	}

	get startX() {
		return this._startX;
	}

	set startY(v) {
		if (this._startY == null) {
			this._startY = v;
		} else {
			warn("The starting coordinates of an Entity are immutable!", "Entity");
		}
	}

	get startY() {
		return this._startY;
	}

	/**
	 * Changes the pivot point of the Entity (in pixels).
	 * The pivot point is the center for rotation and scaling.
	 * @example
	 * this.pivotPoint = { x: 5, y: 20 }
	 */
	set pivotPoint(p) {
		if (this._pixiSprite && this._pixiSprite) {
			this._pixiSprite.pivot.x = p.x || this._pixiSprite.pivot.x;
			this._pixiSprite.pivot.y = p.y || this._pixiSprite.pivot.y;
		}
	}

	/**
	 * Retrieve the currently set pivot point.
	 */
	get pivotPoint() {
		const spr = this._pixiSprite;
		if (spr && spr.pivot) {
			return {
				x: spr.pivot.x,
				y: spr.pivot.y,
			}
		}
	}

	/**
	 * Rotates the Entity in rad.
	 */
	set rotationRad(v) {
		if (this._pixiSprite) {
			this._pixiSprite.rotation = v;
		}
	}

	/**
	 * Rotates the Entity in degrees.
	 */
	set rotationDeg(v) {
		if (this._pixiSprite) {
			this._pixiSprite.rotation = v * DEG_2_RAD;
		}
	}

	/**
	 * Returns the current rotation in rad.
	 */
	get rotationRad() {
		return this._pixiSprite && this._pixiSprite.rotation;
	}

	/**
	 * Returns the current rotation in degree.
	 */
	get rotationDeg() {
		return this._pixiSprite && (this._pixiSprite.rotation / DEG_2_RAD);
	}

	/**
	 * Shorthand for scaling the PIXI Sprite of this Entity.
	 * The center point of the scaling can be set via the pivotPoint property.
	 */
	set scale(p) {
		const spr = this._pixiSprite;
		if (spr) {
			spr.scale.x = p.x || spr.scale.x;
			spr.scale.y = p.y || spr.scale.y;
		}
	}

	/**
	 * Retrieve the scaling on X and Y:
	 * @example
	 * this.scale -> {x: 2, y: 1.5}
	 */
	get scale() {
		const spr = this._pixiSprite;
		if (spr) {
			return {
				x: spr.scale.x,
				y: spr.scale.y
			};
		}
	}

	/**
	 * Shorthand for this.getPixiSprite().getLocalBounds().
	 * Does not respect rotation.
	 * See also https://pixijs.download/release/docs/PIXI.Sprite.html#getLocalBounds.
	 * @returns {PIXI.Rectangle} the local bounding rectangle
	 */
	getLocalBounds() {
		if (this._pixiSprite) {
			return this._pixiSprite.getLocalBounds();
		}
	}

	/**
	 * Shorthand for this.getPixiSprite().getBounds().
	 * Respects rotation.
	 * See also https://pixijs.download/release/docs/PIXI.Sprite.html#getBounds.
	 * @returns {PIXI.Rectangle} the bounding rectangle
	 */
	getBounds() {
		if (this._pixiSprite) {
			return this._pixiSprite.getBounds();
		}
	}

	/**
	 * Returns the Screen instance to which this Entity is added.
	 * If the Entity is not added to a Screen, <code>null</code> is returned.
	 */
	getScreen() {
		return this._screen;
	}

	set layer(v) {
		if (this._screen) {
			this._screen._changeLayer(this, v);
		}
		this._layer = v;
	}

	get layer() {
		return this._layer;
	}

	setTypes(a) {
		if (!Array.isArray(a)) {
			fail("${this}: setType() only accepts an array of types strings!");
		}

		let oldTypes = a._types;
		this._types = a;

		if (this._screen) {
			this._screen._updateTypes(this, oldTypes);
		}
	}

	getTypes() {
		return this._types;
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
			// @PIXI: destroy pixi sprite & it's children if any
			this._pixiSprite.destroy({
				children: true
			});

			if (this._hitbox._gfx) {
				this._hitbox._gfx.destroy({
					children: true
				});
			}

			this._screen.remove(this);
			this._isDestroyed = true;
		}
	}

	/**
	 * Whether the Entity was destroyed.
	 * @public
	 */
	get isDestroyed() {
		return this._isDestroyed;
	}

	/**
	 * Removes the Entity from its current screen.
	 * The Entity is NOT destroyed, and can be re-added to another screen.
	 * @public
	 */
	removeFromScreen() {
		if (this._screen) {
			this._screen.remove(this);
		} else {
			warn(`Could not remove '${this}' from a screen. Entity is not added to a screen.`, "Entity");
		}
	}

	/**
	 * Update hook.
	 * Called once every frame.
	 * Perform game logic here.
	 */
	update() {}

	/**
	 * Updates the Hitbox dimensions.
	 *
	 * Note, concerning debugging:
	 * If the debug option Entity.RENDER_HITBOX or this.RENDER_HITBOX is set, a PIXI.Graphics object is
	 * created for rendering the hitbox. Please keep this in mind with respect to render performance.
	 * @param {object} cfg Hitbox dimensions (x, y, w, h)
	 * @public
	 */
	updateHitbox(cfg) {
		this._hitbox._collidable = true;
		this._hitbox.x = cfg.x != undefined ? cfg.x : this._hitbox.x;
		this._hitbox.y = cfg.y != undefined ? cfg.y : this._hitbox.y;
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
	 * Returns the hitbox dimensions.
	 * Changes to this object will not be reflected in collision detection!
	 * Call updateHitbox() instead.
	 * @returns the hitbox dimensions
	 * @public
	 */
	getHitbox() {
		return {
			x: this._hitbox.x,
			y: this._hitbox.y,
			w: this._hitbox.w,
			h: this._hitbox.h
		};
	}

	/**
	 * Sets whether the entity shall partake in collision detection based
	 * on itshitbox definition.
	 *
	 * @param {boolean} b whether the entity shall partake in collision detection
	 * @public
	 */
	setCollidable(b) {
		this._hitbox._collidable = b;
	}

	/**
	 * Returns whether the Entity is set to collidable or not.
	 * @returns whether the Entity is set to collidable
	 * @public
	 */
	getCollidable() {
		return this._hitbox._collidable;
	}

	/**
	 * Returns if 'this' Entity instance collides with the given Entity 'e'.
	 * Optionally you can provide a position.
	 * This entity instance is then virtually placed at this position for a collision check.
	 * This is helpful if you want to make preemptive collision checks before actually moving
	 * the entity to the given position.
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
	 * @param {Number} [x=this.x] x-coordinate at which the entity will be placed for a collision check, defaults to this.x
	 * @param {Number} [y=this.y] y-coordinate at which the entity will be placed for a collision check, defaults to this.y
	 * @returns {Entity|Entity[]|undefined} either: the first found colliding Entity,
	 *      or if returnAll is set to true: an array of all colliding Entities,
	 *      or if no collision was detected: undefined.
	 */
	collidesWithTypes(types, returnAll=false, x, y) {
		if (this._screen) {
			if (this._hitbox._collidable) {
				return this._screen._collidesWithType(this, types, returnAll, x || this.x, y || this.y);
			} else {
				warn("No collision check performed. Entity is not marked as collidable. Call setCollidable(true).", this);
			}
		} else {
			warn("No collision check performed. The entity is not added to a Screen.", this);
		}
	}

	/**
	 * Sets the global tinting color value for the Entity.
	 * The color value will be used for single sprites and Animations, except:
	 * - if a color is defined on the animation
	 * - if an animation defines a color per key-frame
	 * @param {int} c color value
	 */
	setColor(c) {
		this._color = c;

		// update single sprite color (meaning: no animations)
		// animation tinting will be taken care of during animation updating on a per-frame basis
		if (this._pixiSprite && (this._spriteConfig && !this._spriteConfig.animations)) {
			this._pixiSprite.tint = this._color;
		}
	}

	/**
	 * Sets a new sprite definition, including animations.
	 * The underlying PIXI sprite will configured according to this new sprite configuration.
	 *
	 * Beware: any the previous configuration is not merged with the new one! Partial updates are not supported.
	 *
	 * @param {object} config
	 */
	configSprite(config) {
		// we merge the new config with at least an empty offset object
		this._spriteConfig = config;
		this._spriteConfig.offset = Object.assign({x: 0, y:0}, this._spriteConfig.offset);

		// Figure out what the new BitmapTexture should be
		let newTexture;

		if (this._spriteConfig.sheet) {
			// sprite given via sheet
			let sheet = Spritesheets.getSheet(this._spriteConfig.sheet);

			if (!sheet) {
				fail(`Unknown sheet '${this._spriteConfig.sheet}'!`, "Entity");
			}

			// @PIXI: get texture from sheet (defaults to 0)
			newTexture = sheet.textures[this._spriteConfig.id || 0];
		} else if (this._spriteConfig.texture) {
			// @PIXI: sprite given via texture
			newTexture = this._spriteConfig.texture;
		} else if (this._spriteConfig.replaceWith) {
			// @PIXI: also make sure to destroy the original sprite!
			// @PIXI-TODO: How does destroy work?
			// When replacing do we need to remove it from the stage?
			this._pixiSprite.destroy();

			// Also IMPORTANT: add "replaceWith" DisplayObject to the screen stage!

			// @PIXI: replace the original sprite with another PIXI.DisplayObject
			this._pixiSprite = this._spriteConfig.replaceWith;
		}

		// @PIXI: set the default texture for the pixi sprite & make it visible
		// might be overwritten by an animation definition below
		if (newTexture) {
			this._pixiSprite.texture = newTexture;
			this._pixiSprite.tint = config.color || 0xffffff;
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

					// check first frame (either an integer or an object!)
					let firstFrame = anim.frames[0];
					anim.id = firstFrame.id != undefined ? firstFrame.id : firstFrame;
					anim.dt = anim.dt || 0;

					// configure the initial coloring, either defined on:
					// * the animation
					// * the sheet
					// * or defaulted to white (0xFFFFFF == no tint) during animation handling
					anim.color = anim.color || config.color;
					anim._defaultColor = anim.color;

					// default offset of (0,0)
					// Offsets are relative to the Base-Sprite offset
					anim.offset = Object.assign({x:0, y:0}, anim.offset);

					// if no delay is given, we assume the animation is a "freeze-frame", e.g. an idle-frame
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
	 * @public
	 */
	playAnimation(config) {
		// get old animation first
		let oldAnimation = this._currentAnimation;

		// new animation definition
		this._currentAnimation = this._spriteConfig.animations[config.name];

		if (this._currentAnimation) {
			let animationSwitched = (oldAnimation && oldAnimation != this._currentAnimation)

			// register new handlers if given
			this._currentAnimation.done = config.done;
			this._currentAnimation.change = config.change;

			// reset the animation on two possible conditions:
			// a) reset is forced by the caller
			// b) we switched animations
			if (config.reset || animationSwitched) {
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
	 * Checks whether the Entity is currently playing this animation of the given name.
	 * @param {string} name the animation name
	 * @returns whether the Entity is currently playing this animation of the given name
	 * @public
	 */
	isPlayingAnimation(name) {
		return this._currentAnimation && this._currentAnimation.name == name;
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

				// frameData is either an integer or an object, e.g. {id: 5, color: 0xff0085, dt: 20}
				let frameData = anim.frames[anim.currentFrame];

				// change animation id
				anim.id = frameData.id != undefined ? frameData.id : frameData;

				// update coloring (if the frame data does not provide a different color, we use the default color defined initially)
				anim.color = frameData.color != undefined ? frameData.color : anim._defaultColor;

				// reset the frame-counter to the next frame dt or the animation default
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
			// if no tinting color is defined on the animation, we take the Entity color or as a fallback 'white'.
			this._pixiSprite.tint = anim.color || this._color || 0xFFFFFF;
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