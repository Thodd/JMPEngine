import { log } from "../../../../src/utils/Log.js";
import Entity from "../../../../src/game/Entity.js";

import Constants from "../Constants.js";
import FrameCounter from "../../../../src/utils/FrameCounter.js";

class Enemy extends Entity {
	constructor() {
		super();
		// base values
		this.hp = 2;
		this.ivFrames = 20;
		this.knockback = 1; // in px

		// render layer
		this.layer = Constants.Layers.ENEMIES;

		if (Constants.DEBUG) {
			this.RENDER_HITBOX = 0x00f2ff;
		}

		// default hitbox
		this.updateHitbox({
			x: 4,
			y: 4,
			w: 8,
			h: 8
		});

		this.moveFC = new FrameCounter(2);
	}

	update() {

		if (this.moveFC.isReady()) {
			this.y+=1;
		}

		this.checkProjectileCollision();

		if (!this.isDestroyed) {
			this.aiUpdate();
		}
	}

	/**
	 * Process collision with projectiles.
	 * Hurts the enemy if IV-Frames are not active (bound to hurt animation).
	 */
	checkProjectileCollision() {

		// check for death
		let bulletCollision = this.collidesWithTypes(["player_bullet"],false);
		if (bulletCollision) {

			// release the bullet
			// TODO: piercing projectiles, are not released ?
			bulletCollision.release();

			// push back a little
			this.y -= this.knockback;

			if (!this.isPlayingAnimation("hurt")) {
				// TODO: laser power as damage!
				this.hurt(1);
			}

			// TODO: Starfield background
		}
	}

	/**
	 * Hurts the enemy by the given amount of damage.
	 *
	 * @param {int} dmg the damage taken
	 * @returns whether the enemy died
	 */
	hurt(dmg) {
		let myScreen = this.getScreen();

		this.hp -= dmg;

		this.playAnimation({ name: "hurt", reset:true });

		// schedule frame event to end the hurt animation
		myScreen.registerFrameEvent(() => {
			this.playAnimation({ name: "idle" });
		}, this.ivFrames);

		if (this.hp <= 0) {
			log("enemy died");
			myScreen.enemyDeathEmitter.emit({
				x: this.x + 8,
				y: this.y + 8
			});
			this.destroy();
			return true;
		}

		return false;
	}

	aiUpdate() {}
}

export default Enemy;