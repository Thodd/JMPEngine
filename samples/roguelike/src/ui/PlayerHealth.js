// JMP imports
import BitmapText from "../../../../src/game/BitmapText.js";
import Helper from "../../../../src/utils/Helper.js";

// engine imports
import Events from "../engine/Events.js";

// gamecontent imports
import Colors from "../gamecontent/Colors.js";

// own imports
import UIBase from "./UIBase.js";

class PlayerHealth extends UIBase {
	constructor(spec) {
		super({
			screen: spec.screen,
			event: Events.STATS_CHANGED
		});

		this._hpIndicator = new BitmapText({
			font: "rlfont",
			x: spec.x,
			y: spec.y,
			text: "Thor Heyerdahl",
			color: Colors[3]
		});
		this._screen.add(this._hpIndicator);

		this._colors = [Colors[15],Colors[7],Colors[6],Colors[5],Colors[4],Colors[3]];

		// "wobble animation" if player HP is <= than 25%
		this._hpIndicator.update = function() {
			if (this._hpPercent <= 0.25) {
				let chars = this._hpIndicator.getAllCharSprites();
				chars.forEach((c, i) => {
					c.x = i * 16;
					c.y = 0;
					c.x += Helper.choose([0, 1, -1]);
					c.y += Helper.choose([0, 1, -1]);
				});
			}
		}.bind(this);
	}

	update(evt) {
		// update the indicator color based on the HP/HP_MAX percentage
		let stats = evt.data;
		this._hpPercent = stats.hp / stats.hp_max;
		let colorIndex = Math.floor((this._colors.length-1) * this._hpPercent);

		this._hpIndicator.setColor(this._colors[colorIndex]);

		if (this._hpPercent > 0.25) {
			// getting and setting the text restores the original positioning
			this._hpIndicator.setText(this._hpIndicator.getText());
		}
	}
}

export default PlayerHealth;