import { warn } from "../utils/Log.js";
import Entity from "../game/Entity.js";
import Fonts from "../assets/Fonts.js";

import PIXI from "../core/PIXIWrapper.js";

class BitmapText extends Entity {
	constructor({text, x, y, font="font0", color=null, leading=0, noKerning=false}) {
		super(x, y);
		this._text = null;
		this.leading = leading;
		this.noKerning = noKerning;

		// @PIXI: Destroy the initial pixi sprite created by the super Entity constructor, shouldn't be much of an issue
		this._pixiSprite.destroy();

		// we just need a container to store all single character sprites
		this._pixiSprite = new PIXI.Container();
		this._spritePool = [];

		this.setFont(font);

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

			// shorthand vars
			let font = this._font;
			let kerningTree = font._kerningTree;
			// only true of kerning is not explicitly deactivated
			let useKerning = kerningTree && !this.noKerning;

			// color stack
			let colorStack = [];

			// loop var
			let nextSprite = 0;
			let yOffset = 0;

			// iterate all lines
			for (let i = 0; i < lines.length; i++) {

				let line = lines[i];
				let lineLength = line.length;

				let kerningValueAcc = 0;
				let x = 0;
				let shift = 0;

				// loop through all characters per line
				while (x < lineLength) {
					let char = line[x];

					// color lookahead
					if (char == "<") {
						let next4 = line.substr(x+1, 4);
						if (next4 == "c=0x") {
							// TODO: this is stupid, but let's get it running before optimizing
						}
					}

					let charDef = font.getChar(char);
					let charSprite = this._spritePool[nextSprite];

					// set characters
					charSprite.x = shift + kerningValueAcc;
					charSprite.y = yOffset;
					charSprite.texture = charDef.texture;

					// kerning lookahead for next character
					if (useKerning) {
						let lookahead = line[x+1];
						if (lookahead != null) {
							if ((kerningTree[char] && kerningTree[char][lookahead] != null)) {
								kerningValueAcc += kerningTree[char][lookahead];
							} else {
								// fallback if there is no kerning pair defined
								kerningValueAcc += kerningTree["default"] || 0;
							}
						}
					}

					// apply spacing value if defined
					if (useKerning && char == " ") {
						shift += kerningTree["spacing"] || font.w;
					} else {
						// default character shift for monospaced fonts
						shift += font.w;
					}

					// @PIXI: Tint the char if a global color was set
					if (this._color != null) {
						charSprite.tint = this._color;
					}

					// @PIXI: Make the sprite visible since it's in range
					charSprite.visible = true;

					// keep track of the used sprites from the pool
					nextSprite++;

					// next character in line
					x++;
				}

				// shift next line down (and additionally space it by the given leading amount)
				yOffset += (font.h + this.leading);

			}
		}
	}

	/**
	 * Returns the currently set text string.
	 */
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
	 * @param {integer} i the index in the set text
	 */
	getSpriteForChar(i) {
		if (i < 0 || i >= this._maxChars) {
			//warn(`The character index '${i}' is out of range for the BitmapText instance.`, "BitmapText");
			return undefined;
		}

		return this._spritePool[i];
	}

	/**
	 * Returns the list of all PIXI.Sprites used to render the currently set text.
	 *
	 * <b>IMPORTANT</b>:
	 * Don't change the parent/PIXI.Container of these PIXI.Sprite(s)!
	 * They will be reused for ALL texts which are set to this BitmapText entity.
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
	 * Changes the font of the Bitmap text.
	 * Text will be rerendered.
	 */
	setFont(font) {
		this._font = Fonts.getFont(font);

		if (this._text) {
			this.setText(this._text);
		}
	}

	/**
	 * Returns the Font instance.
	 */
	getFont() {
		return this._font;
	}
}

export default BitmapText;