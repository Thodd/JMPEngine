
import Constants from "../../Constants.js";
import BaseEffect from "./BaseEffect.js";

class Leaves extends BaseEffect {
	constructor() {
		super();

		this.configSprite({
			sheet: "tile_effects",
			color: Constants.Colors.GREEN_DARK,
			animations: {
				default: "scatter",
				scatter: {
					frames: [0,1,2,3,4],
					dt: 2
				}
			}
		});
	}
	reset() {
		this.playAnimation({
			name: "scatter",
			done: () => {
				this.done();
			}
		});
	}
}

export default Leaves;