
import BaseEffect from "./BaseEffect.js";

class Leaves extends BaseEffect {
	constructor() {
		super();

		this.configSprite({
			sheet: "tile_effects",
			animations: {
				default: "scatter",
				scatter: {
					frames: [5,6,7,8, 9],
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