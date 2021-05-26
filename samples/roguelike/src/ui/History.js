// JMP imports
import BitmapText from "../../../../src/game/BitmapText.js";

// engine imports
import Events from "../engine/Events.js";

// gamecontent imports
import Colors from "../gamecontent/Colors.js";
import { yy } from "../engine/utils/RLTools.js";

// own imports
import UIBase from "./UIBase.js";

class History extends UIBase {
	constructor(spec) {
		super({
			screen: spec.screen,
			event: Events.HISTORY
		});

		this._screen = spec.screen;

		// the last messages in the history
		this._entries = ["","","","","Were am I?"];

		// the colors for each line
		this._colors = [Colors[1],Colors[1],Colors[8],Colors[8],Colors[0], Colors[0]];

		this.createUIElements(spec.x, spec.y);

		// initial render
		this.update({data: "Looks like a forest..."});
	}

	getEntries() {
		return this._entries;
	}

	createUIElements(x, y) {
		// init text elements
		for (let i = 0; i < 6; i++) {
			let line = new BitmapText({
				font: "rlfont",
				x: x,
				y: y + yy(i)
			});
			this._screen.add(line);

			this["_line"+i] =line;
		}
	}

	/**
	 * Tracks all messages and renders only a limited set of entries.
	 * @param {object} evt event data storing the new messages
	 */
	update(evt) {
		if (evt.data) {
			// track all messages
			this._entries.push(evt.data);

			// make sure we don't store too many entries
			if (this._entries.length > 6) {
				this._entries.shift();
			}

			//this._text.setText(this._entries.join("\n"));
			for (let i = 0; i < this._entries.length; i++) {
				let line = this["_line"+i];
				line.setText(this._entries[i]);
				line.setColor(this._colors[i]);
			}
		}
	}
}

export default History;