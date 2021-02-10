import Entity from "../../../../src/game/Entity.js";
import FrameCounter from "../../../../src/utils/FrameCounter.js";

import Constants from "../Constants.js";
class Actor extends Entity {
	constructor(x, y, config) {
		super(x, y);

		// default looking direction
		this.dir = "down";

		// default basic values
		config = config || {};

		// no hit detection by default
		this._damagedByTypes = config.damagedByTypes || null;

		// knockback config
		this._knockback = Object.assign({
			x: 0,
			y: 0,
			possible: true,
			active: false,
			duration: Math.ceil(Constants.TILE_HEIGHT * 0.75)
		}, config.knockback);
		this._knockback.fc = new FrameCounter(this._knockback.duration);

		// hurting animation (non-blocking, can be performed simultaneous to other things)
		this._hurting = Object.assign({
			possible: true,
			active: false,
			duration: 60,
			// blink every other frame
			blink: new FrameCounter(1)
		}, config.hurting);
		this._hurting.fc = new FrameCounter(this._hurting.duration);

		// stats config
		this.stats = Object.assign({
			hp_mx: 2,
			hp: 2,
			dmg: 0.5
		}, config.stats);
	}

	/**
	 *
	 * @param {number} damage the amount of damage
	 * @param {Actor} source the Actor from which the damage was received
	 */
	takeDamage(damage, source) {
		if (damage > 0) {
			// activate hurting animation
			// deal damage only when hurting is possible and no "invincibility frames"
			if (this._hurting.possible && !this._hurting.active) {
				this.stats.hp -= damage;
				this._hurting.active = true;
			}

			// activate knockback (only if possible for this Actor)
			// multiple knockbacks after successive hits are OK though.
			// Allows the Player to "whop around" the Actor.
			if (this._knockback.possible) {
				this._knockback.x = this.x > source.x ? 2 : -2;
				this._knockback.y = this.y > source.y ? 2 : -2;
				this._knockback.active = true;
			}
		}
	}

	/**
	 * Returns the damage done by this Actor.
	 * By default it's the base-stats damage modifier.
	 */
	getDamageOutput() {
		return this.stats.dmg;
	}

	/**
	 * Lifecycle Hook for hit detection.
	 * only called if the Actor has no iframes.
	 */
	hitDetection() {
		// hit detection (if not already hurting)
		if (!this._hurting.active && this._damagedByTypes) {
			let collidingActor = this.collidesWithTypes(this._damagedByTypes);
			if (collidingActor) {
				this.takeDamage(collidingActor.getDamageOutput(), collidingActor);
			}
		}
	}

	/**
	 * Standard implementations for Actor update lifecylce:
	 * - Hurting Animation
	 * - Knockback Animation
	 */
	update() {
		if (this._hurting.active) {
			// blink
			if (this._hurting.blink.isReady()) {
				this.visible = !this.visible;
			}
			this._hurting.active = !this._hurting.fc.isReady();

			// hurting state has changed this frame: reset visiblity & blink-fc
			if (!this._hurting.active) {
				this.visible = true;
				this._hurting.blink.reset();
			}
		} else {
			// only done if the hurting animation is not active
			this.hitDetection();
		}

		if (this._knockback.active) {
			// once the knockback time is over we stop the movement
			this._knockback.active = !this._knockback.fc.isReady();

			let x = this.x + this._knockback.x;
			let y = this.y + this._knockback.y;

			let tm = this.getTilemap();
			if (!this.collidesWith(tm, x, this.y)) {
				this.x = x;
			}
			if (!this.collidesWith(tm, this.x, y)) {
				this.y = y;
			}
		}
	}

	/**
	 * Convenience function to get the Tilemap on which this Actor is placed.
	 */
	getTilemap() {
		return this.getScreen().getTilemap();
	}

	/**
	 * Gets the closest Tile to this actor's hitbox origin (x,y).
	 * The parameters dy and dy can be used to shift the origin.
	 * By default the center of the hitbox is taken.
	 * So if you leave dx and dy empty, they default to half the hitbox width/height.
	 *
	 * @param {int} [dy=undefined] delta on the x axis
	 * @param {int} [dy=undefined] delta on the y axis
	 * @returns {GameTile|undefined} returns either the GameTile instance closest to this actor,
	 *                               or undefined if the actor is not added to a screen,
	 *                               or the actor is placed outside the range of the Tilemap.
	 */
	getClosestTile(dx, dy) {
		let screen = this.getScreen();
		if (screen) {
			dx = dx != undefined ? dx : Math.round(this._hitbox.w/2);
			dy = dy != undefined ? dy : Math.round(this._hitbox.h/2);

			let tm = screen.getTilemap();

			let w = Constants.TILE_WIDTH;
			let h = Constants.TILE_HEIGHT;

			let x = this.x + this._hitbox.x + dx;
			let y = this.y + this._hitbox.y + dy;

			return tm.get(Math.floor(x / w), Math.floor(y / h));
		}
	}

	/**
	 * Returns all Tiles this actor is touching wrt. its hitbox.
	 * Touching means ALL tiles, no matter if they are
	 */
	getTouchingTiles() {
		let screen = this.getScreen();
		let tm = screen.getTilemap();

		let w = Constants.TILE_WIDTH;
		let h = Constants.TILE_HEIGHT;

		let left = this.x + this._hitbox.x;
		let right = this.x + this._hitbox.x + this._hitbox.w - 1;
		let top = this.y + this._hitbox.y;
		let bottom = this.y + this._hitbox.y + this._hitbox.h - 1;

		let tileTopRight = tm.get(Math.floor(right / w), Math.floor(top / h));
		let tileTopLeft = tm.get(Math.floor(left / w), Math.floor(top / h));

		let tileBottomRight = tm.get(Math.floor(right / w), Math.floor(bottom / h));
		let tileBottomLeft = tm.get(Math.floor(left / w), Math.floor(bottom / h));

		let result = [];
		tileTopRight ? result.push(tileTopRight) : undefined;
		tileTopLeft ? result.push(tileTopLeft) : undefined;
		tileBottomRight ? result.push(tileBottomRight) : undefined;
		tileBottomLeft ? result.push(tileBottomLeft) : undefined;

		return result;
	}
}

export default Actor;