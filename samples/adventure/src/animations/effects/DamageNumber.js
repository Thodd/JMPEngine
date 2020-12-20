import Constants from "../../Constants.js";
import BitmapText from "../../../../../src/game/BitmapText.js";

/**
 * DamageNumbers don't extend BaseEffect, since they are completely handled by the HurtAnimation.
 */
class DamageNumber extends BitmapText {
	constructor() {
		super({
			text: undefined,
			x: 0,
			y: 0,
			font: "font1",
			color: Constants.Colors.YELLOW_DARK,
			leading: 0
		});

		this.layer = Constants.Layers.EFFECTS_ABOVE_ACTORS;

		// no update needed, will be handled by the HurtAnimation which instantiated the DamageNumber
		this.active = false;

		this.visible = false;
	}

	reset() {
		this.visible = false;
	}

	reposition(gameTile) {
		this.x = gameTile.x * Constants.TILE_WIDTH;
		this.y = gameTile.y * Constants.TILE_HEIGHT - 13; // always render above the actor
	}
}

export default DamageNumber;