import GFX from "../gfx/GFX.js";

/**
 * Entity Constructor
 *
 * Call
 */
class Entity {
	constructor() {
		this._ID = Entity.INSTANCE_COUNT++;

		this._screen = null;

		this.active = true;
		this.visible = true;
		this._isDestroyed = false;

		// gfx
		this.sprite = null;
		this.x = 0;
		this.y = 0;
		this.layer = 0;

		// collision
		this.hitbox = {
			x: 0,
			y: 0,
			w: 16,
			h: 16
		};
	}

	toString() {
		return `${this.constructor.name} (${this._ID})`;
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
	 * Render hook.
	 * Called once after every update loop.
	 *
	 * IMPORTANT:
	 * To keep the default rendering behavior intact,
	 * call "super.render()" at the beginning of your custom render function.
	 *
	 * @example
	 *
	 * Simple:
	 * e.sprite = {
	 *     sheet: "characters"
	 *     offsetX: -5,
	 *     offsetY: 2,
	 *     id: 0
	 * }
	 *
	 * Animations:
	 * e.sprite = {
	 *    animations: {
	 *        walk: {
	 *            sheet: "characters"
	 *            frames: [0, 5, 1, 5],
	 *            delay: 10
	 *        }
	 *    }
	 * }
	 *
	 * e.playAnimation({
	 *     name: "walk",
	 *     loop: true,
	 *     done: function() {
	 *         // called after every animation loop
	 *     }
	 * });
	 *
	 * e.playAnimation({
	 *     name: "walk",
	 *     done: function() {
	 *         // do stuff
	 *     },
	 *     abort: function() {
	 *         // aborted
	 *     }
	 * });
	 *
	 * e.abortCurrentAnimation();
	 */
	render() {
		if (this.sprite != null) {
			var dx = this.x + (this.sprite.offsetX || 0);
			var dy = this.y + (this.sprite.offsetY || 0);
			// sheet, id, layer, x, y, w, h, color
			GFX.spr_ext(this.sprite.sheet, this.sprite.id, dx, dy, this.sprite.w, this.sprite.h, this.layer, this.sprite.color);
		}
	}
}

Entity.INSTANCE_COUNT = 0;

export default Entity;