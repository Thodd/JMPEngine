import Entity from "../../../../../src/game/Entity.js";
import Constants from "../../Constants.js";

class Blood extends Entity {
	constructor({gameTile}) {
		// position the Blood splatter correctly on a GameTile
		super(gameTile.x * Constants.TILE_WIDTH, gameTile.y * Constants.TILE_HEIGHT);

		this.configSprite({
			sheet: "blood",
			animations: {
				splatter: {
					frames: [0,1,2,3],
					dt: 3
				},
				done: {
					frames: [4]
				}
			}
		})
	}
}

export default Blood;