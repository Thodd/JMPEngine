import Actor from "../Actor.js";

class Enemy extends Actor {
	constructor(x, y) {
		super(x, y);

		//this.RENDER_HITBOX = 0xFF0000;

		this.updateHitbox({
			x: 4,
			y: 4,
			w: 12,
			h: 12
		});

		this.setTypes(["enemy"]);
	}
}

export default Enemy;