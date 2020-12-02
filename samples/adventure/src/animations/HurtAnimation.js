import FrameCounter from "../../../../src/utils/FrameCounter.js";
import BaseAnimation from "./BaseAnimation.js";

class HurtAnimation extends BaseAnimation {
	constructor(actor) {
		super(actor);
		this.fc = new FrameCounter(2);
	}

	reset() {
		super.reset();
		this.fc.reset();
	}

	animate() {
		if (this.fc.isReady()) {
			this.actor.visible = !this.actor.visible;
			// stop after 5 loops
			if (this.fc.looped() >= 5) {
				this.done();
				this.actor.visible = true;
			}
		}
	}
}

export default HurtAnimation;