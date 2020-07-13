import { warn, fail } from "../utils/Log.js";
import Entity from "../game/Entity.js";
import Fonts from "../assets/Fonts.js";

import PIXI from "../core/PIXIWrapper.js";

class Text extends Entity {
	constructor({text, x, y, font="font0", color="#FFFFFF", leading=0, kerning=false}) {
		super(x, y);
		this._color = color;
		this.leading = leading;
		this.kerning = kerning;

		// @PIXI: Destroy the initial pixi sprite created by the super Entity constructor, shouldn't be much of an issue
		this._pixiSprite.destroy();

		// we just need a container to store all single character sprites
		this._pixiSprite = new PIXI.Container();
		this._spritePool = [];

		this._font = Fonts.getFont(font);

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

	/**
	 * Set the text of this BitmapText entity and additionally creates PIXI.Sprite instances if needed.
	 * @param {string} text
	 */
	setText(text) {
		this.text = text;

		if (this.text != "") {
			// check for linebreak style
			let lineDelimiter = this.text.indexOf("\n\r") >= 0 ? "\n\r" : "\n";

			let lines = this.text.split(lineDelimiter);

			// calculate needed sprites
			let neededSprites = 0;
			for (let i = 0; i < lines.length; i++) {
				neededSprites += lines[i].length;
			}

			// create sprites for the pool
			// we loop over the max number so we can directly set all sprites to invisible
			let mx = Math.max(this._spritePool.length, neededSprites)
			for (let i = 0; i < mx; i++) {
				if (!this._spritePool[i]) {
					let spr = new PIXI.Sprite();
					this._pixiSprite.addChild(spr);
					this._spritePool[i] = spr;
				}
				this._spritePool[i].visible = false;
			}

			// set characters line by line
			let nextSprite = 0;
			let yOff = 0;

			for (let i = 0; i < lines.length; i++) {
				let line = lines[i];

				for (let x = 0; x < line.length; x++) {
					let char = line[x];
					let charDef = this._font.getChar(char);
					let charSprite = this._spritePool[nextSprite];

					charSprite.x = x * this._font.w;
					charSprite.y = yOff;
					charSprite.texture = charDef.texture;

					charSprite.visible = true;

					// keep track of the used sprites from the pool
					nextSprite++;
				}

				yOff += (this._font.h + this.leading);

			}
		}
	}

	/**
	 * Not supported for BitmapTexts.
	 */
	configSprite() {
		warn("'configSprite()' is not supported for BitmapTexts. Please use 'setFont()' and 'setText()'.", "BitmapText");
	}

	/**
	 * Not yet implemented.
	 */
	setFont() {
		// TODO: Implement font change at runtime
		warn(`'setFont()' is not implemented yet.`, "BitmapText");
	}
}

export default Text;