import Entity from "../../../../../src/game/Entity.js";
import Constants from "../../Constants.js";

class Blood extends Entity {
	constructor(gameTile) {
		// position the Blood splatter correctly on a GameTile
		super(gameTile.x * Constants.TILE_WIDTH, gameTile.y * Constants.TILE_HEIGHT);

		this.layer = Constants.Layers.EFFECTS_BELOW_ACTORS;

		// just a graphics effect, no logic update needed
		this.active = false;

		this.configSprite({
			sheet: "blood",
			animations: {
				default: "splatter",
				splatter: {
					frames: [0,1,2,3,4],
					dt: 3
				},
				done: {
					frames: [5]
				}
			}
		});

		this.playAnimation({
			name: "splatter",
			done: () => {
				//this.destroy();
				this.playAnimation({name: "done"});
			}
		});
	}
}

export default Blood;