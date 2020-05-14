import { warn, fail } from "../utils/Log.js";
import GFX from "./GFX.js";
import Buffer from "./Buffer.js";
import Entity from "../game/Entity.js";
import Manifest from "../Manifest.js";

class Text extends Entity {
	constructor({text, x, y, font="font0", color="#FFFFFF", leading=0, useKerning=false}) {
		super({x, y});
		this._color = color;
		this.leading = leading;
		this.useKerning = useKerning;

		this.setFont(font);
		this.setText(text);
	}

	setSprite() {
		fail("setSprite(): Text entities do not support additional sprites!", "Text-Entity");
	}

	/**
	 * Change the color of the Text.
	 * Beware: Changing the color leads to a rerendering of the complete Text!
	 * @param {string} c CSS color string
	 */
	set color(c) {
		this._color = c;
		// when the color is set we need to rerender the offscreen buffer
		this.setText(this.text);
	}

	setText(text) {
		this.text = text;

		if (this.text != "") {
			// check for linebreak style
			let lineDelimiter = this.text.indexOf("\n\r") >= 0 ? "\n\r" : "\n";

			let lines = this.text.split(lineDelimiter);

			// find longest line
			let longestLine = 0;
			for (let i = 0; i < lines.length; i++) {
				let line = lines[i];
				if (line.length > longestLine) {
					longestLine = line.length;
				}
			}

			let kerningDiff = 0;
			if (this.useKerning && this.font.kerning) {
				kerningDiff = this.font.kerning.maxPositiveKerning || 0;
			}

			// we dimension the offscreen buffer to the maximum width without considering kerning for simplicity
			this.backbuffer = new Buffer(
				// width
				(longestLine + kerningDiff) * this.font.w,
				// height
				(this.font.h + this.leading) * lines.length
			);
			this.backbuffer.setRenderMode(GFX.getBuffer(this.layer).getRenderMode());

			// render line per line to the offscreen buffer
			for (let i = 0; i < lines.length; i++) {
				let line = lines[i];
				this.backbuffer.renderer.text(
					this.font.name,
					// no x and y offsets relative to the Text Entity
					// the buffer will later be rendered to the Entity coordinates
					0,
					(i * this.font.h) + (i * this.leading),
					line,
					this._color,
					this.useKerning
				);
			}
		}

	}

	setFont(font) {
		let fontObj = Manifest.get(`/assets/fonts/${font}`);
		if (fontObj) {
			this.font = fontObj;
		} else {
			warn(`The font '${font}' is unknown. Default font 'font0' will be set.`, "Text-Entity");
			this.font = Manifest.get(`/assets/fonts/font0`);
		}
	}

	render() {
		let dx = this.x - this.scale.x;
		let dy = this.y - this.scale.y;
		let dw = this.backbuffer.width * this.scale.w;
		let dh = this.backbuffer.height * this.scale.h;

		GFX.get(this.layer).renderOffscreenBuffer(this.backbuffer, dx, dy, dw, dh, this.alpha);
	}
}

export default Text;