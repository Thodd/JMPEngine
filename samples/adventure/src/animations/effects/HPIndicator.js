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
			font: "FontDamage",
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

	/**
	 * Places the Entity over the given tile.
	 * @param {GameTile} gameTile the game tile over which the HPIndicator is shown
	 */
	reposition(gameTile) {
		this.x = gameTile.x * Constants.TILE_WIDTH;
		this.y = gameTile.y * Constants.TILE_HEIGHT - 13; // always render above the actor
	}

	/**
	 * Centers the text depending on the length of the number.
	 */
	center() {
		let tlen = this.getText().length;
		let xDif = 0;
		switch(tlen) {
			case 1: xDif =  2; break; // e.g. "0", "1"
			case 2: xDif = -1; break; // e.g. "-3", "+2"
			case 4: xDif = -2; break; // e.g. "-1.5"
		}

		this.x += xDif;
	}
}

export default HPIndicator;