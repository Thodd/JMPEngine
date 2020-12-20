import BaseEffect from "./BaseEffect.js";

class Blood extends BaseEffect {
	constructor() {
		super();

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
	}

	reset() {
		this.playAnimation({
			name: "splatter",
			done: () => {
				this.playAnimation({name: "done"});
				this.done();
			}
		});
	}
}

export default Blood;