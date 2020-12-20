
import BaseEffect from "./BaseEffect.js";

class Leaves extends BaseEffect {
	constructor() {
		super();

		this.configSprite({
			sheet: "leaves",
			animations: {
				default: "scatter",
				scatter: {
					frames: [0,1,2],
					dt: 3
				},
				done: {
					frames: [3]
				}
			}
		});
	}
	reset() {
		this.playAnimation({
			name: "scatter",
			done: () => {
				this.playAnimation({name: "done"});
				this.done();
			}
		});
	}
}

export default Leaves;