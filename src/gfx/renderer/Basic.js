import { warn, fail } from "../../utils/Log.js";
import Fonts from "../Fonts.js";
import Spritesheets from "../Spritesheets.js";
import ColorTools from "../ColorTools.js";
import PerformanceTrace from "../../utils/PerformanceTrace.js";

const _2PI = 2 * Math.PI;

// to make geometric rendering less blurred
const n = Math.floor;

class Basic {
	constructor(buffer, manifest) {
		// We still keep a reference on the Manifest object here.
		// We don't want to go through the path-parsing of the Manifest everytime.
		//  [!] The GFX module has to run as smooth as possible and the API functions
		//      get called multiple times during each frame.
		// Only the cases which are not called that often use the Manifest API.
		this.manifest = manifest;

		this.buffer = buffer;
		this._canvasDOM = this.buffer.getCanvas();
		this._ctx = this.buffer.getContext();
	}

	/**
	 * GFX Module API
	 */

	alpha(v) {
		this._ctx.globalAlpha = v;
	}

	clear(color) {
		if (color) {
			this._canvasDOM.style.background = color;
		}
		this._ctx.clearRect(0, 0, this.manifest.w, this.manifest.h);

		// if a pixel buffer exists clear it too
		if (this._pixelBuffer) {
			this._pixelBuffer = new ImageData(this.manifest.w, this.manifest.h);
		}
	}

	clear_rect(color, x, y, w, h) {
		if (color) {
			this._canvasDOM.style.background = color;
		}

		// clear everything inside the given rectangle
		// for w/h we default to the screen-size
		this._ctx.clearRect(x, y, w || this.manifest.w, h || this.manifest.h);

		// TODO: pixel buffers don't work with clearing a rectangle right now -> fix?
	}

	trans(x, y) {
		this._ctx.translate(x, y);
	}

	save() {
		this._ctx.save();
	}

	restore() {
		this._ctx.restore();
	}

	getPixelBuffer() {
		if (!this._pixelBuffer) {
			this._pixelBuffer = this._ctx.getImageData(0, 0, this.manifest.w, this.manifest.h);
		}
		return this._pixelBuffer;
	}

	/**
	 * Flush the pixels in the Buffer to the Screen.
	 * The Screen class calls this function at the end of each frame.
	 *
	 * <b>Beware</b>: Don't call this manually. Might lead to unwanted side effects.
	 */
	flush() {
		if (this._pixelBuffer) {
			this._ctx.putImageData(this._pixelBuffer, 0, 0);

			PerformanceTrace.drawCalls++;
		}
	}

	/**
	 * Renders a Pixel of the given color at coordinates (x,y).
	 *
	 * <b>Beware:</b>
	 * The px* routines are the lowest level of GFX API.
	 * Setting, clearing and flushing pixels might lead to unwanted side-effects during rendering.
	 * Go with the subpx() function for a simple pixel rendering if possible.
	 *
	 * @param {integer} x
	 * @param {integer} y
	 * @param {string} color CSS-color string
	 */
	px(x, y, color) {
		let d = this.getPixelBuffer();
		let c = ColorTools.parseColorString(color);
		let off = 4 * (y * d.width + x);
		d.data[off + 0] = c.r;
		d.data[off + 1] = c.g;
		d.data[off + 2] = c.b;
		d.data[off + 3] = (c.a != undefined) || 255;
	}

	/**
	 * Clears the pixel at position (x,y).
	 *
	 * <b>Beware:</b>
	 * The px* routines are the lowest level of GFX API.
	 * Setting, clearing and flushing pixels might lead to unwanted side-effects during rendering.
	 * Go with the subpx() function for a simple pixel rendering if possible.
	 *
	 * @param {integer} x
	 * @param {integer} y
	 */
	pxClear(x, y){
		this.px(x, y, "rgba(0,0,0,0)");
	}

	/**
	 * Renders an antialiased sub-pixel of the given color at coordinates (x,y).
	 * @param {Number} x can be a float
	 * @param {Number} y can be a float
	 * @param {CSS-String} color CSS-color string (actual color value depends on the browsers sub-pixel rendering algorithm)
	 */
	subpx(x, y, color) {
		this.rectf(x, y, 1, 1, color);
	}

	rect(x, y, w, h, color) {
		this._ctx.beginPath();
		this._ctx.strokeStyle = color || this._ctx.strokeStyle;
		this._ctx.strokeRect(n(x), n(y), w, h);
		this._ctx.stroke();
		this._ctx.closePath();

		PerformanceTrace.drawCalls++;
	}

	rectf(x, y, w, h, color) {
		this._ctx.fillStyle = color || this._ctx.fillStyle;
		this._ctx.fillRect(x, y, w, h);

		PerformanceTrace.drawCalls++;
	}

	circ(x, y, r, color) {
		this._ctx.beginPath();
		this._ctx.arc(x, y, r, 0, _2PI, false);
		this._ctx.closePath();
		this._ctx.strokeStyle = color || this._ctx.strokeStyle;
		this._ctx.stroke();

		PerformanceTrace.drawCalls++;
	}

	circf(x, y, r, color) {
		this._ctx.beginPath();
		this._ctx.arc(x, y, r, 0, _2PI, false);
		this._ctx.closePath();
		this._ctx.fillStyle = color || this._ctx.fillStyle;
		this._ctx.fill();

		PerformanceTrace.drawCalls++;
	}

	tri(x0, y0, x1, y1, x2, y2, color) {
		this._ctx.beginPath();
		this._ctx.moveTo(n(x0), n(y0));
		this._ctx.lineTo(n(x1), n(y1));
		this._ctx.lineTo(n(x2), n(y2));
		this._ctx.closePath();
		this._ctx.strokeStyle = color || this._ctx.strokeStyle;
		this._ctx.stroke();

		PerformanceTrace.drawCalls++;
	}

	trif(x0, y0, x1, y1, x2, y2, color) {
		this._ctx.beginPath();
		this._ctx.moveTo(x0, y0);
		this._ctx.lineTo(x1, y1);
		this._ctx.lineTo(x2, y2);
		this._ctx.closePath();
		this._ctx.fillStyle = color || this._ctx.fillStyle;
		this._ctx.fill();

		PerformanceTrace.drawCalls++;
	}

	line(x0, y0, x1, y1, color) {
		this._ctx.beginPath();
		this._ctx.moveTo(n(x0), n(y0));
		this._ctx.lineTo(n(x1), n(y1));
		this._ctx.closePath();
		this._ctx.strokeStyle = color || this._ctx.strokeStyle;
		this._ctx.stroke();

		PerformanceTrace.drawCalls++;
	}

	spr(sheet, id, x, y, sColor) {
		let sprCanvas = Spritesheets.getCanvasFromSheet(sheet, id, sColor);
		this._ctx.drawImage(sprCanvas, x || 0, y || 0);

		PerformanceTrace.drawCalls++;
	}

	spr_ext(sheet, id, x, y, w, h, color, alpha) {
		let sprCanvas = Spritesheets.getCanvasFromSheet(sheet, id, color);

		let oldAlpha;
		if (alpha !== undefined) {
			oldAlpha = this._ctx.globalAlpha;
			if (oldAlpha !== alpha) {
				this._ctx.globalAlpha = alpha;
			}
		}

		this._ctx.drawImage(
			sprCanvas,
			// take the whole src sprite canvas as a base
			0, // sx
			0, // sy
			sprCanvas.width, // sw
			sprCanvas.height, // sh
			// stretch it if w/h is given
			x || 0,
			y || 0,
			w || sprCanvas.width, // default to canvas width
			h || sprCanvas.height, // default to canvas height
		);

		PerformanceTrace.drawCalls++;

		if (oldAlpha) {
			this._ctx.globalAlpha = oldAlpha;
		}
	}

	grid(id, x, y) {
		let grid = this.manifest._maps[id];
		if (!grid) {
			fail(`Grid '"${id}' does not exist!`);
		}
		this._ctx.drawImage(grid.canvas, x, y);

		PerformanceTrace.drawCalls++;
	}

	/**
	 * Renders a single line of text.
	 * @param {string} font the font which should be used for rendering, e.g. "font0"
	 */
	text(font, x, y, msg, color, useKerning=false) {
		let fontObj = this.manifest.assets.fonts[font];

		let kerningTree;
		if (useKerning) {
			kerningTree = fontObj._kerningTree;
			if (!kerningTree) {
				warn(`Kerning for GFX.text(${font}, ...) call was activated, though no kerning data is available for this font.`, "GFX.text");
			}
		}

		let kerningValueAcc = 0;
		let ml = msg.length;
		let i = 0;
		let shift = 0;

		while(i < ml) {
			let c = msg[i];

			this._ctx.drawImage(Fonts.getChar(fontObj, c, color), x + shift + kerningValueAcc, y);

			if (useKerning) {
				// we have to check all characters + their look-ahead for kerning values
				let lookahead = msg[i+1];
				if (lookahead != null) {
					if ((kerningTree[c] && kerningTree[c][lookahead] != null)) {
						kerningValueAcc += kerningTree[c][lookahead];
					}
				}
			}

			// check if the font has a spacing value defined
			if (useKerning && c == " ") {
				shift += fontObj.kerning.spacing || fontObj.w;
			} else {
				// default character shift for monospaced fonts
				shift += fontObj.w;
			}

			i++;

			PerformanceTrace.drawCalls++;
		}
	}

	/**
	 * Renders the given offscreen Buffer instance to the screen.
	 *
	 * @param {Buffer} buffer the Buffer object.
	 * @param {Number} x target x
	 * @param {Number} y target y
	 */
	renderOffscreenBuffer(buffer, x, y) {
		this._ctx.drawImage(buffer._canvasDOM, x, y);
	}
}

export default Basic;