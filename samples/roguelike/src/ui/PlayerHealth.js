// JMP imports
import BitmapText from "../../../../src/game/BitmapText.js";

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
			text: "───────♥──────",
			color: Colors[3]
		});
		this._screen.add(this._hpIndicator);

		this._colors = [Colors[15],Colors[7],Colors[6],Colors[5],Colors[4],Colors[3]];
	}

	update(evt) {
		// update the indicator color based on the HP/HP_MAX percentage
		let stats = evt.data;
		let hpPercent = stats.hp / stats.hp_max;
		let colorIndex = Math.floor((this._colors.length-1) * hpPercent);

		this._hpIndicator.setColor(this._colors[colorIndex]);
	}
}

export default PlayerHealth;