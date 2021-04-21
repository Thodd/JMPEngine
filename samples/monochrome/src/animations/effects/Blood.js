import BaseEffect from "./BaseEffect.js";
import Constants from "../../Constants.js";
class Blood extends BaseEffect {
	constructor() {
		super();

		this.configSprite({
			sheet: "tile_effects",
			color: Constants.Colors.RED_LIGHT,
			animations: {
				default: "splatter",
				splatter: {
					frames: [0,1,2,3],
					dt: 2
				}
			}
		});
	}

	reset() {
		this.playAnimation({
			name: "splatter",
			done: () => {
				this.done();
			}
		});
	}
}

export default Blood;