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

	done() {
		super.done();
		this._dmgNumber.visible = false;
	}

	animate() {
		this._dmgNumber.visible = true;
		this._dmgNumber._pixiSprite.alpha -= 0.025;
		//this._dmgNumber.y -= 0.5;
		if (this.fc.isReady()) {

			// blink in red
			this.actor.visible = !this.actor.visible;
			if (this.actor.visible) {
				this.actor.setColor(0xFF0000);
			} else {
				this.actor.setColor(undefined);
			}

			// stop after 5 loops
			if (this.fc.looped() >= 5) {
				this.done();

				// make actor visible again and reset tint color to default
				this.actor.visible = true;
				this.actor.setColor(undefined);

				// hide damage number again
				this._dmgNumber.visible = false;
			}
		}
	}
}

export default HurtAnimation;