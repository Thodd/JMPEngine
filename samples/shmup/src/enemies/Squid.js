import Enemy from "./Enemy.js";

class Squid extends Enemy {
	constructor() {
		super();

		this.configSprite({
			sheet: "enemies",
			animations: {
				default: "idle",
				idle: {
					frames: [1, {id: 2, dt: 10}],
					dt: 60
				},
				hurt: {
					frames: [0, 3],
					dt: 2
				}
			}
		});
	}
}

export default Squid;