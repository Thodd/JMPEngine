import FrameCounter from "../../../../src/utils/FrameCounter.js";
import BaseAnimation from "./BaseAnimation.js";

import HPIndicator from "./effects/HPIndicator.js";

class HPUpdateAnimation extends BaseAnimation {
	constructor() {
		super();
		this.fc = new FrameCounter(2);

		// create damage number indicator
		this._hpIndicator = new HPIndicator();

		// health update delta
		this._healthDelta = 0;

		// blinking color either Green (heal) or red (damage)
		this._blinkColor = undefined;
	}

	/**
	 * Retrieves the delta of the actors health.
	 * Can be positive or negative.
	 * Used for consolidating health updates if an Actor is affected multiple times through a turn.
	 */
	getHPDelta() {
		return this._healthDelta;
	}

	reset() {
		super.reset();
		this.fc.reset();

		// Add the hp-update indicator number to the screen if its not already added
		// we keep these entities in the screen since they are reused anyway
		// removing and readding them is unnecessary
		if (this._hpIndicator.getScreen() == null) {
			this.actor.getScreen().add(this._hpIndicator);
		}

		// position the damage number on the screen
		this._hpIndicator.visible = false; // initially invisible, visibility is set once the HPUpdateAnimation actually starts
		this._hpIndicator._pixiSprite.alpha = 1;
		this._hpIndicator.reposition(this.actor.getTile());
	}

	/**
	 * Changes the HP update number.
	 * @param {int} hpDelta the delta value which should be displayed
	 */
	setNumber(hpDelta) {
		let fnt;

		this._healthDelta = hpDelta;

		// for positive numbers we need to add a "+" since it's lost in a regular JS string
		// we also set the color depending on the hpDelta sign
		let plusSign = "";
		if (hpDelta > 0) {
			fnt = "FontHeal";
			this._blinkColor = 0x00FF00;
			plusSign = "+";
		} else {
			fnt = "FontDamage";
			this._blinkColor = 0xFF0000;
		}

		// make sure the damage number is a string!
		this._hpIndicator.setText(`${plusSign}${hpDelta}`);
		this._hpIndicator.setFont(fnt);
		this._hpIndicator.center();
	}

	done() {
		super.done();
		this._hpIndicator.visible = false;
	}

	animate() {
		this._hpIndicator.visible = true;
		this._hpIndicator._pixiSprite.alpha -= 0.025;
		//this._hpIndicator.y -= 1;
		if (this.fc.isReady()) {

			// blink in red
			this.actor.visible = !this.actor.visible;
			if (this.actor.visible) {
				this.actor.setColor(this._blinkColor);
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
				this._hpIndicator.visible = false;
			}
		}
	}
}

export default HPUpdateAnimation;