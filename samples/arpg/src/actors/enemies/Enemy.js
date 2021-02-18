import DebugMode from "../../../../../src/utils/DebugMode.js";
import Actor from "../Actor.js";

class Enemy extends Actor {
	constructor(x, y, config) {
		super(x, y, config);

		if (DebugMode.enabled) {
			this.RENDER_HITBOX = 0xFF0000;
		}

		this.updateHitbox({
			x: 2,
			y: 2,
			w: 14,
			h: 14
		});

		this.setTypes(["enemy"]);

		this._damagedByTypes = ["attack"];
	}

	getStrength() {
		return 1;
	}
}

export default Enemy;