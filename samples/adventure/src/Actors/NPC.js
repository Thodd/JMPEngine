import BaseActor from "./BaseActor.js";

class NPC extends BaseActor {
	constructor({gameTile}) {
		super({gameTile});

		this.isBlocking = true;

		this.configSprite({
			sheet: "enemies",
			offset: {
				x: -3,
				y: -7
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

	takeTurn() {

	}

}

export default NPC;