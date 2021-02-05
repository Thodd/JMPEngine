import Enemy from "./Enemy.js";

class Wolf extends Enemy {
	constructor(x, y) {
		super(x, y);

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
}

export default Wolf;