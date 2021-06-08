import { fail, warn } from "../utils/Log.js";
import Entity from "../game/Entity.js";
import Fonts from "../assets/Fonts.js";

import PIXI from "../core/PIXIWrapper.js";

class BitmapText extends Entity {
	constructor({text, x, y, font="font0", color=0xFFFFFF, leading=0, noKerning=false}) {
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
	 *
	 * @param {object} err error information
	 */
	_errorColorValue(err) {
		fail(
			`BitmapText parser encountered broken color value ${err.colorValue} at line:${err.lineNumber}, pos:${err.pos}.
Line text was: '${err.lineText}'.`, "BitmapText");
	}

	_errorClosingTag(err) {
		fail(
			`BitmapText parser encountered unexpected closing color tag at line:${err.lineNumber}, pos:${err.pos}.
Line text was: '${err.lineText}'.`, "BitmapText");
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
			let colorStack = [this._color];

			// loop var
			let nextSprite = 0;
			let yOffset = 0;

			// iterate all lines
			for (let i = 0; i < lines.length; i++) {

				let line = lines[i];
				// keep a reference on the original line, in case the color coding is broken
				let originalLine = line;
				// same with the original position
				let originalX = 0;

				let kerningValueAcc = 0;
				let x = 0;
				let shift = 0;

				// loop through all characters per line
				while (x < line.length) {
					let char = line[x];
					let color = colorStack[colorStack.length-1];

					// inline color lookahead
					// not the most elegant parser, but good enough.
					// A bit too greedy in case of broken tags, but whatever
					// [Comment to future self]: Write a real parser if more tags need to be added :)
					if (char == "<") {
						let next3 = line.substr(x+1, 3);
						if (next3 == "c=0") {
							// get color and starting tokens <c=0x......>
							let colorRaw = line.substr(x+3, 8);
							let colorValue = parseInt(colorRaw);
							if (isNaN(colorValue)) {
								this._errorColorValue({
									lineNumber: i,
									pos: originalX,
									lineText: originalLine
								});
							}
							colorStack.push(colorValue);
							line = line.substr(x+12, line.length);
							x = 0;
							continue;
						} else if (next3 == "/c>") {
							if (colorStack.length > 1) {
								// consume closing tokens </c>
								line = line.substr(x+4, line.length);
								colorStack.pop();
								x = 0;
								continue;
							} else {
								this._errorClosingTag({
									lineNumber: i,
									pos: originalX,
									lineText: originalLine
								});
							}
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

					// @PIXI: Tint the char
					charSprite.tint = color;

					// @PIXI: Make the sprite visible since it's in range
					charSprite.visible = true;

					// keep track of the used sprites from the pool
					nextSprite++;

					// next character in line
					x++;
					originalX++; // doesn't change in case of color coding
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