import Entity from "../../../../../src/game/Entity.js";
import BitmapText from "../../../../../src/game/BitmapText.js";

import PlayerState from "../../actors/player/PlayerState.js";
import Constants from "../../Constants.js";

class GameUI {
	constructor(screen) {

		// the screen instance associated with this set of UI elements
		this.screen = screen;

		// background layer
		let gfxBG = new Entity();
		gfxBG.layer = Constants.Layers.UI_BG;
		gfxBG.configSprite({sheet: "UI"});
		this.screen.add(gfxBG);

		// player life
		this._lifeText = new BitmapText({
			x: 13, y: 2,
			leading: 1,
			text: `${PlayerState.stats.hp}/${PlayerState.stats.hp_max}`,
			color: Constants.Colors.RED_LIGHT,
			font: "font0"
		});
		this._lifeText.layer = Constants.Layers.UI_TEXT;
		this.screen.add(this._lifeText);

		// player atk
		this._atkText = new BitmapText({
			x: 83, y: 2,
			leading: 1,
			text: `${PlayerState.stats.atk}`,
			color: Constants.Colors.YELLOW_LIGHT,
			font: "font0"
		});
		this._atkText.layer = Constants.Layers.UI_TEXT;
		this.screen.add(this._atkText);

		// player def
		this._defText = new BitmapText({
			x: 113, y: 2,
			leading: 1,
			text: `${PlayerState.stats.def}`,
			color: Constants.Colors.BLUE_LIGHT,
			font: "font0"
		});
		this._defText.layer = Constants.Layers.UI_TEXT;
		this.screen.add(this._defText);
	}

	updateData() {
		// we check the dirty flag so we don't unnecessarily update the BitmapTexts every frame
		if (PlayerState._isDirty) {

			// update all BitmapTexts
			this._lifeText.setText(`${PlayerState.stats.hp}/${PlayerState.stats.hp_max}`);
			this._atkText.setText(`${PlayerState.stats.atk}`);
			this._defText.setText(`${PlayerState.stats.def}`);

			PlayerState._isDirty = false;
		}
	}
}

export default GameUI;