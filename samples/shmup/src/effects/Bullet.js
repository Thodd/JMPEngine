import { log } from "../../../../src/utils/Log.js";
import Entity from "../../../../src/game/Entity.js";
import Constants from "../Constants.js";

class _Bullet extends Entity {
	constructor() {
		super();
		this.layer = Constants.Layers.PROJECTILES;
		this.setTypes(["player_bullet"]);
	}

	/**
	 * Changes the bullet type.
	 * @param {object} type the type of bullet
	 */
	reset(type) {
		this._type = type;

		this.active = true;
		this.visible = true;
		this.setCollidable(true);

		this.configSprite({
			sheet: "projectiles",
			id: type.sprite.id
		});

		if (Constants.DEBUG) {
			this.RENDER_HITBOX = 0xFF0085;
		}

		this.updateHitbox(type.hitbox);
	}

	/**
	 * Release the bullet back to the pool.
	 */
	release() {
		Bullet.release(this);
	}

	update() {
		this.y -= 3;

		// hide and deactive the bullet if off-screen
		if (this.y < -20) {
			this.release();
		}
	}
}

/**
 * Bullet instance pool.
 */
const pool = [];

const Bullet = {
	get(type, screen) {
		let b = pool.pop();

		// create new instance if needed
		if (!b) {
			b = new _Bullet();
			screen.add(b);
			log(`new instance with type '${type.name}' created`, "Bullet");
		}

		// reactivate the bullet
		b.reset(type);

		return b;
	},

	/**
	 * Releases a bullet back to the pool.
	 * @param {Bullet} b the bullet that is returned to the pool
	 */
	release(b) {
		b.active = false;
		b.visible = false;
		b.setCollidable(false);
		pool.push(b);
	},

	Types: {
		LASER: {
			name: "LASER",
			sprite: {
				id: 4
			},
			hitbox: { x: 6, y: 5, w: 4, h: 8 }
		}
	}
}

export default Bullet;