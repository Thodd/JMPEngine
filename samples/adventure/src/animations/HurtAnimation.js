import FrameCounter from "../../../../src/utils/FrameCounter.js";
import BaseAnimation from "./BaseAnimation.js";

import DamageNumber from "./effects/DamageNumber.js";

class HurtAnimation extends BaseAnimation {
	constructor() {
		super();
		this.fc = new FrameCounter(2);

		// create damage number indicator
		this._dmgNumber = new DamageNumber();
	}

	reset() {
		super.reset();
		this.fc.reset();

		// Add the dmg number indicator to the screen if its not already added.
		if (this._dmgNumber.getScreen() == null) {
			this.actor.getScreen().add(this._dmgNumber);
		}

		// position the damage number on the screen
		this._dmgNumber.visible = false; // initially invisible, visibility is set once the HurtAnimation actually starts
		this._dmgNumber._pixiSprite.alpha = 1;
		this._dmgNumber.reposition(this.actor.getTile());

	}

	setDamageNumber(dmg) {
		// make sure the damage number is a string!
		this._dmgNumber.setText(`-${dmg}`);
	}

	animate() {
		this._dmgNumber.visible = true;
		this._dmgNumber._pixiSprite.alpha -= 0.05;
		//this._dmgNumber.y -= 0.5;
		if (this.fc.isReady()) {
			this.actor.visible = !this.actor.visible;
			// stop after 5 loops
			if (this.fc.looped() >= 5) {
				this.done();
				this.actor.visible = true;
				this._dmgNumber.visible = false; // hide damage number again
			}
		}
	}
}

export default HurtAnimation;