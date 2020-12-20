import FrameCounter from "../../../../src/utils/FrameCounter.js";
import BaseAnimation from "./BaseAnimation.js";

import EffectPool from "./effects/EffectPool.js";
import Blood from "./effects/Blood.js";

class DeathAnimation extends BaseAnimation {
	constructor() {
		super();
		this.fc = new FrameCounter(0);
	}

	reset() {
		super.reset();
		this.fc.reset();

		// get blood effect and place it on the tile
		this.blood = EffectPool.get(Blood, this.actor.getTile());
		this.actor.getScreen().add(this.blood);
	}

	animate() {
		if (this.fc.isReady()) {
			this.done();
		}
	}
}

export default DeathAnimation;