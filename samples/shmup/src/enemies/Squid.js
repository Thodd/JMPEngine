import Enemy from "./Enemy.js";

class Squid extends Enemy {
	constructor() {
		super();

		this.configSprite({
			sheet: "enemies",
			animations: {
				default: "idle",
				idle: {
					frames: [4, {id: 5, dt: 10}],
					dt: 60
				}
			}
		});
	}
}

export default Squid;