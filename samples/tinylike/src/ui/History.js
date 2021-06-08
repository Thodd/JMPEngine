// JMP imports
import BitmapText from "../../../../src/game/BitmapText.js";

// engine imports
import Events from "../engine/Events.js";

// gamecontent imports
import Colors from "../gamecontent/Colors.js";
import { yy } from "../engine/utils/RLTools.js";

// own imports
import UIBase from "./UIBase.js";
import PIXI from "../../../../src/core/PIXIWrapper.js";
import Constants from "../gamecontent/Constants.js";
import Entity from "../../../../src/game/Entity.js";

class History extends UIBase {
	constructor(spec) {
		super({
			screen: spec.screen,
			event: Events.HISTORY
		});

		this._screen = spec.screen;

		// the last messages in the history
		this._entries = ["Were am I?"];

		// the colors for each line
		this._colors = [Colors[8],Colors[0]];

		this.createUIElements(spec.x, spec.y);

		// initial render
		this.update({data: "Looks like a forest..."});

		// interval id for removing hiding the history
		this.hideTimer = null;
	}

	getEntries() {
		return this._entries;
	}

	createUIElements(x, y) {
		// BG
		let bgGFX = new PIXI.Graphics();
		bgGFX.beginFill(0x000000);
		bgGFX.drawRect(0, 0, Constants.TILE_WIDTH * Constants.VIEWPORT_WIDTH, Constants.TILE_HEIGHT * 2);
		bgGFX.endFill();
		this.bgEntity = new Entity();
		this.bgEntity.y = yy(16);
		this.bgEntity.configSprite({
			replaceWith: bgGFX
		});
		this.bgEntity.alpha = 0.5;
		this._screen.add(this.bgEntity);

		// init text elements
		for (let i = 0; i < 2; i++) {
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
			if (this._entries.length > 2) {
				this._entries.shift();
			}

			//this._text.setText(this._entries.join("\n"));
			for (let i = 0; i < this._entries.length; i++) {
				let line = this["_line"+i];
				line.setText(this._entries[i]);
				line.setColor(this._colors[i]);
				line.visible = true;
			}

			this.bgEntity.visible = true;

			// remove previous timeout
			if (this.hideTimer) {
				this._screen.cancelFrameEvent(this.hideTimer);
			}
			// register new timeout for 180 frames (=3 seconds)
			this.hideTimer = this._screen.registerFrameEvent(() => {
				this.bgEntity.visible = false;
				for (let i = 0; i < this._entries.length; i++) {
					let line = this["_line"+i];
					line.visible = false;
				}
			}, 180);
		}
	}
}

export default History;