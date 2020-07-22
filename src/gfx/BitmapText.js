import { warn, fail } from "../utils/Log.js";
import Entity from "../game/Entity.js";
import Fonts from "../assets/Fonts.js";

import PIXI from "../core/PIXIWrapper.js";

class Text extends Entity {
	constructor({text, x, y, font="font0", color=null, leading=0, kerning=false}) {
		super(x, y);
		this._text = null;
		this.leading = leading;
		this.kerning = kerning;

		// @PIXI: Destroy the initial pixi sprite created by the super Entity constructor, shouldn't be much of an issue
		this._pixiSprite.destroy();

		// we just need a container to store all single character sprites
		this._pixiSprite = new PIXI.Container();
		this._spritePool = [];

		this._font = Fonts.getFont(font);

		this.setColor(color);
		this.setText(text);
	}

	/**
	 * Change the color of the Text.
	 * @param {number} c the color in hex format, same as you would use it with PIXI: e.g. 0xFF0085
	 */
	setColor(c) {
		this._color = c;

		// color is changed after the text was set
		if (this._text) {
			for (let i = 0; i < this._maxChars; i++) {
				let spr = this._spritePool[i];
				spr.tint = this._color;
			}
		}
	}

	getColor() {
		return this._color;
	}

	/**
	 * Set the text of this BitmapText entity and additionally creates PIXI.Sprite instances if needed.
	 * If kerning is activated all characters are positions based on the kerning table of the font.
	 * @param {string} text
	 */
	setText(text) {
		this._text = text;

		if (this._text != undefined) {
			// check for linebreak style
			let lineDelimiter = this._text.indexOf("\n\r") >= 0 ? "\n\r" : "\n";

			let lines = this._text.split(lineDelimiter);

			// calculate needed sprites
			let neededSprites = 0;
			for (let i = 0; i < lines.length; i++) {
				neededSprites += lines[i].length;
			}

			// track the number of actual sprites
			this._maxChars = neededSprites;

			// create sprites for the pool
			// we loop over the max number so we can directly set all sprites to invisible
			let mx = Math.max(this._spritePool.length, neededSprites)
			for (let i = 0; i < mx; i++) {
				let spr = this._spritePool[i];
				if (!spr) {
					spr = new PIXI.Sprite();
					this._spritePool.push(spr);
					this._pixiSprite.addChild(spr);
				}
				// we set all sprites to invisible in the beginning
				// and later only make the ones we need visible
				spr.visible = false;
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

					// @PIXI: Tint the char if a global color was set
					if (this._color != null) {
						charSprite.tint = this._color;
					}

					// @PIXI: Make the sprite visible since it's in range
					charSprite.visible = true;

					// keep track of the used sprites from the pool
					nextSprite++;
				}

				yOff += (this._font.h + this.leading);

			}
		}
	}

	getText() {
		return this._text;
	}

	/**
	 * Returns the PIXI.Sprite instance for the character at index 'i'
	 * in the set text.
	 *
	 * Note: excluding line-breaks (\n\r) or (\n).
	 *
	 * <b>IMPORTANT</b>:
	 * Don't change the parent/PIXI.Container of this PIXI.Sprite!
	 * It will be reused for ALL texts which are set to this BitmapText entity.
	 *
	 * PS: I trust you on this!
	 * PSS: I'll know if you mess this up! And then I'll be disappointed >:|
	 *
	 * @param {integer} i the index in the set text
	 */
	getSpriteForChar(i) {
		if (i < 0 || i >= this._maxChars) {
			fail(`The character index '${i}' is out of range for the BitmapText instance.`, "BitmapText");
		}

		return this._spritePool[i];
	}

	/**
	 * Returns the list of all PIXI.Sprites used to render the currently set text.
	 *
	 * <b>IMPORTANT</b>:
	 * Don't change the parent/PIXI.Container of these PIXI.Sprite(s)!
	 * They will be reused for ALL texts which are set to this BitmapText entity.
	 *
	 * PS: I trust you on this!
	 * PSS: I'll know if you mess this up! And then I'll be disappointed >:|
	 */
	getAllCharSprites() {
		return this._spritePool.slice(0, this._maxChars);
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