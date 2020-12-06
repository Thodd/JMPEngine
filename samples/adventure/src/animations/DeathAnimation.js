import FrameCounter from "../../../../src/utils/FrameCounter.js";
import BaseAnimation from "./BaseAnimation.js";
import Blood from "./effects/Blood.js";

class DeathAnimation extends BaseAnimation {
	constructor() {
		super();
		this.fc = new FrameCounter(0);
	}

	reset() {
		super.reset();
		this.fc.reset();

		// simple: create a new blood entity everytime...
		// TODO: can we optimize this? Reusing the blood entities makes them vanish from the screen...
		//       but we could save some resources by doing so :/
		this.blood = new Blood(this.actor.getTile());
		this.actor.getScreen().add(this.blood);
	}

	animate() {
		if (this.fc.isReady()) {
			this.done();
		}
	}
}

export default DeathAnimation;