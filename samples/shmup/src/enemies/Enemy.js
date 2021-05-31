import { log } from "../../../../src/utils/Log.js";
import Entity from "../../../../src/game/Entity.js";

import Constants from "../Constants.js";

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
	}

	update() {
		// check for death
		let bulletCollision = this.collidesWithTypes(["player_bullet"],false);
		if (bulletCollision) {

			// important: release the bullet, so we don't handle
			// additional collision checks in the next frame!
			bulletCollision.release();

			this.hp -= 1;


			// TODO: When Enemy has HP left --> hurt animation (blink) & iv-frames

			// TODO: Move ParticleEmitter to JMP engine

			// TODO: Starfield background


			if (this.hp <= 0) {
				log("enemy died");
				this.getScreen().particleEmitter.emit({
					x: this.x + 8,
					y: this.y + 8,
					gravity: 1, // gives off a speed effect
					delay: 1,
					colors: [0xff004d, 0xffa300, 0xffec27, 0xc2c3c7, 0xfff1e8]
				});
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