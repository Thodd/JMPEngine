import Enemy from "./Enemy.js";
import RNG from "../../../../../src/utils/RNG.js";

class Snake extends Enemy {
	constructor({gameTile}) {
		super({gameTile});

		this.name = "Snake";

		this.configSprite({
			sheet: "enemies",
			offset: {
				x: -1,
				y: -1
			},
			animations: {
				default: "right",
				"left": {
					frames: [0, 1],
					dt: 40
				},
				"right": {
					frames: [2, 3],
					dt: 40
				}
			}
		});
	}

}

export default Snake;