import { log } from "../../../../src/utils/Log.js";
import Entity from "../../../../src/game/Entity.js";

import Constants from "../Constants.js";
import FrameCounter from "../../../../src/utils/FrameCounter.js";

class Enemy extends Entity {
	constructor() {
		super();
		// base HP
		this.hp = 2;

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

		// hurt animation
		this.canBeHurt = true;
		this.ivFramesCounter = new FrameCounter(10);
	}

	update() {

		this.checkCollision();

		if (!this.isDestroyed) {
			this.aiUpdate();
		}
	}

	hurt(dmg) {
		this.hp -= dmg;

		this.playAnimation({name: "hurt", reset:true});

		if (this.hp <= 0) {
			log("enemy died");
			this.getScreen().particleEmitter.emit({
				x: this.x + 8,
				y: this.y + 8
			});
			this.destroy();
			return;
		}

		this.canBeHurt = false;
	}

	checkCollision() {

		// check for death
		let bulletCollision = this.collidesWithTypes(["player_bullet"],false);
		if (bulletCollision) {

			// release the bullet
			// TODO: piercing projectiles, are not released ?
			bulletCollision.release();

			if (this.canBeHurt) {
				this.hurt(1);
			}

			// TODO: Starfield background
		}
	}

	aiUpdate() {}
}

export default Enemy;