import Constants from "../../Constants.js";
import BitmapText from "../../../../../src/game/BitmapText.js";

/**
 * HPIndicator don't extend BaseEffect, since they are completely handled by the HPUpdateAnimation.
 */
class HPIndicator extends BitmapText {
	constructor() {
		super({
			text: undefined,
			x: 0,
			y: 0,
			font: "font1",
			leading: 0
		});

		this.layer = Constants.Layers.ABOVE_ACTORS;

		// no update needed, will be handled by the HPUpdateAnimation which instantiated the HPIndicator
		this.active = false;

		this.visible = false;
	}

	reset() {
		this.visible = false;
	}

	reposition(gameTile) {
		this.x = gameTile.x * Constants.TILE_WIDTH - 2;
		this.y = gameTile.y * Constants.TILE_HEIGHT - 13; // always render above the actor
	}
}

export default HPIndicator;