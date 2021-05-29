import { log } from "../../../../src/utils/Log.js";
import Entity from "../../../../src/game/Entity.js";

import Constants from "../Constants.js";

class Enemy extends Entity {
	constructor() {
		super();
		// base HP
		this.hp = 1;

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
	}

	update() {
		// check for death
		let bulletCollision = this.collidesWithTypes(["player_bullet"],false);
		if (bulletCollision) {

			bulletCollision.release();

			this.hp -= 1;

			if (this.hp <= 0) {
				log("enemy died");
				this.destroy();
			}
		}

		if (!this.isDestroyed) {
			this.aiUpdate();
		}
	}

	aiUpdate() {}
}

export default Enemy;