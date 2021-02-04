import Actor from "../Actor.js";

class Enemy extends Actor {
	constructor(x, y) {
		super(x, y);

		this.RENDER_HITBOX = 0xFF0000;

		this.updateHitbox({
			x: 4,
			y: 4,
			w: 12,
			h: 12
		});

		this.configSprite({
			sheet: "enemies",
			offset: {
				x: -8,
				y: -8
			},
			animations: {
				default: "idle",
				"idle": {
					frames: [0, 1],
					dt: 30
				}
			}
		});
	}

	update() {
		// do nothing, just stand around for now
	}
}

export default Enemy;