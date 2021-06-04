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
				},
				hurt: {
					frames: [0, 6],
					dt: 2
				}
			}
		});
	}
}

export default Squid;