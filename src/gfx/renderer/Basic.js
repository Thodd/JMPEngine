import { warn, fail } from "../../utils/Log.js";
import Fonts from "../Fonts.js";
import Spritesheets from "../Spritesheets.js";
import PerformanceTrace from "../../utils/PerformanceTrace.js";

// to make geometric rendering less blurred
const n = Math.floor;

/**
 * Basic Render Module
 * @module Basic
 */
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

	_release() {}

	/**
	 * Helper functions
	 */
	_isRectangleInView(x, y, w, h) {
		// sprite dimensions
		let x1 = x;
		let y1 = y;
		let w1 = w;
		let h1 = h;

		// screen dimensions
		let x2 = this.buffer.camX;
		let y2 = this.buffer.camY;
		let w2 = this.manifest.w;
		let h2 = this.manifest.h;

		// check if sprite is in view
		// While the calculation has some overhead it still reduces the number of draw calls.
		// With a lot of Entities this is significantly faster than "drawing" offscreen sprites.
		// Browsers still seem to be very bad at ignoring offscreen render calls...
		if (x1 < x2 + w2 &&
			x1 + w1 > x2 &&
			y1 < y2 + h2 &&
			y1 + h1 > y2) {
				return true;
		}

		return false;
	}

	/**
	 * GFX Module API
	 */
	alpha(a) {
		if (a >= 0) {
			this._ctx.globalAlpha = a;
		} else {
			return this._ctx.globalAlpha;
		}
	}

	clear() {
		this._ctx.clearRect(0, 0, this.manifest.w, this.manifest.h);
	}

	clear_rect(x, y, w, h) {
		// clear everything inside the given rectangle
		// for w/h we default to the screen-size
		this._ctx.clearRect(x, y, w || this.manifest.w, h || this.manifest.h);
	}

	save() {}

	restore() {}

	flush() {}

	/**
	 * Renders a pixel of the given color at (x,y).
	 *
	 * For pixel perfect rendering please use the <code>GFX.RenderMode.Raw</code>.
	 * Call <code>GFX.getBuffer(n).setRenderMode(GFX.RenderMode.Raw)</code> to change the RenderMode of
	 * the Screen layer at depth 'n'.
	 *
	 * @param {Number} x can be a float
	 * @param {Number} y can be a float
	 * @param {CSS-String} color CSS-color string (actual color value depends on the browsers sub-pixel rendering algorithm)
	 */
	pxSet(x, y, color) {
		// check if pixel is inside the viewport, drawRect is more expensive than this check
		if (this._isRectangleInView(x,y,1,1)) {
			this.rectf(x, y, 1, 1, color);
		}
	}

	pxGet(/*x, y*/) {
		fail("Unsupported operation 'pxGet(...)' for RenderMode.BASIC!", "RenderMode.BASIC");
	}

	/**
	 * Clears the pixel at position (x,y).
	 *
	 * @param {integer} x
	 * @param {integer} y
	 */
	pxClear(x, y){
		// shift x/y based on camera
		x = n(x - this.buffer.camX);
		y = n(y - this.buffer.camY);

		this.clear_rect("transparent", x, y, 1, 1);
	}

	rect(x, y, w, h, color) {
		// shift x/y based on camera
		x = n(x - this.buffer.camX);
		y = n(y - this.buffer.camY);

		// draw rectangle
		this._ctx.beginPath();
		this._ctx.strokeStyle = color || this._ctx.strokeStyle;
		this._ctx.strokeRect(x, y, w, h);
		this._ctx.stroke();
		this._ctx.closePath();

		PerformanceTrace.drawCalls++;
	}

	rectf(x, y, w, h, color) {
		// shift x/y based on camera
		x = x - this.buffer.camX;
		y = y - this.buffer.camY;

		// draw rectangle filled
		this._ctx.fillStyle = color || this._ctx.fillStyle;
		this._ctx.fillRect(x, y, w, h);

		PerformanceTrace.drawCalls++;
	}

	circ(x, y, r, color) {
		// shift x/y based on camera
		x = x - this.buffer.camX;
		y = y - this.buffer.camY;

		// draw circle
		this._ctx.beginPath();
		this._ctx.arc(x, y, r, 0, 2 * Math.PI, false);
		this._ctx.closePath();
		this._ctx.strokeStyle = color || this._ctx.strokeStyle;
		this._ctx.stroke();

		PerformanceTrace.drawCalls++;
	}

	circf(x, y, r, color) {
		// shift x/y based on camera
		x = x - this.buffer.camX;
		y = y - this.buffer.camY;

		// draw circle filled
		this._ctx.beginPath();
		this._ctx.arc(x, y, r, 0, 2 * Math.PI, false);
		this._ctx.closePath();
		this._ctx.fillStyle = color || this._ctx.fillStyle;
		this._ctx.fill();

		PerformanceTrace.drawCalls++;
	}

	tri(x0, y0, x1, y1, x2, y2, color) {
		// shift x/y based on camera
		x0 = n(x0 - this.buffer.camX);
		y0 = n(y0 - this.buffer.camY);

		x1 = n(x1 - this.buffer.camX);
		y1 = n(y1 - this.buffer.camY);

		x2 = n(x2 - this.buffer.camX);
		y2 = n(y2 - this.buffer.camY);

		// draw triangle
		this._ctx.beginPath();
		this._ctx.moveTo(x0, y0);
		this._ctx.lineTo(x1, y1);
		this._ctx.lineTo(x2, y2);
		this._ctx.closePath();
		this._ctx.strokeStyle = color || this._ctx.strokeStyle;
		this._ctx.stroke();

		PerformanceTrace.drawCalls++;
	}

	trif(x0, y0, x1, y1, x2, y2, color) {
		// shift x/y based on camera
		x0 = x0 - this.buffer.camX;
		y0 = y0 - this.buffer.camY;

		x1 = x1 - this.buffer.camX;
		y1 = y1 - this.buffer.camY;

		x2 = x2 - this.buffer.camX;
		y2 = y2 - this.buffer.camY;

		// draw triangle filled
		this._ctx.beginPath();
		this._ctx.moveTo(x0, y0);
		this._ctx.lineTo(x1, y1);
		this._ctx.lineTo(x2, y2);
		this._ctx.closePath();
		this._ctx.fillStyle = color || this._ctx.fillStyle;
		this._ctx.fill();

		PerformanceTrace.drawCalls++;
	}

	poly(points, x, y, color) {
		let dx = x - this.buffer.camX;
		let dy = y - this.buffer.camY;

		this._ctx.beginPath();
		this._ctx.moveTo(points[0].x + dx, points[0].y + dy);
		for (let i = 1, len = points.length; i < len; i++) {
			let p = points[i];
			this._ctx.lineTo(p.x + dx, p.y + dy);
		}
		this._ctx.closePath();

		this._ctx.strokeStyle = color || this._ctx.strokeStyle;
		this._ctx.stroke();

		PerformanceTrace.drawCalls++;
	}

	polyf(points, x, y, color) {
		let dx = x - this.buffer.camX;
		let dy = y - this.buffer.camY;

		this._ctx.beginPath();
		this._ctx.moveTo(points[0].x + dx, points[0].y + dy);
		for (let i = 1, len = points.length; i < len; i++) {
			let p = points[i];
			this._ctx.lineTo(p.x + dx, p.y + dy);
		}
		this._ctx.closePath();
		this._ctx.fillStyle = color || this._ctx.fillStyle;
		this._ctx.fill();

		PerformanceTrace.drawCalls++;
	}

	line(x0, y0, x1, y1, color) {
		// shift x/y based on camera
		x0 = n(x0 - this.buffer.camX);
		y0 = n(y0 - this.buffer.camY);

		x1 = n(x1 - this.buffer.camX);
		y1 = n(y1 - this.buffer.camY);

		// draw line
		this._ctx.beginPath();
		this._ctx.moveTo(x0, y0);
		this._ctx.lineTo(x1, y1);
		this._ctx.closePath();
		this._ctx.strokeStyle = color || this._ctx.strokeStyle;
		this._ctx.stroke();

		PerformanceTrace.drawCalls++;
	}

	/**
	 * Renders a sprite at the given coordinates.
	 * @param {string} sheet spritesheet name
	 * @param {integer} id sprite id in the sheet
	 * @param {integer} x x
	 * @param {integer} y y
	 * @param {string} color css color string
	 */
	spr(sheet, id, x, y, color) {
		this.spr_ext(sheet, id, undefined, undefined, undefined, undefined, x, y, undefined, undefined, color, undefined);
	}

	/**
	 * Renders a sprite at the given coordinates.
	 *
	 * @param {string} sheet spritesheet name
	 * @param {integer} id sprite id in the sheet
	 * @param {integer} sx clipping X
	 * @param {integer} sy clipping Y
	 * @param {integer} sw clipping width
	 * @param {integer} sh clipping height
	 * @param {integer} tx draw x
	 * @param {integer} ty draw y
	 * @param {integer} tw target width
	 * @param {integer} th target height
	 * @param {string} color css color string
	 */
	spr_ext(sheet, id, sx, sy, sw, sh, tx, ty, tw, th, color, alpha) {
		let sprCanvas = Spritesheets.getCanvasFromSheet(sheet, id, color);

		if (this._isRectangleInView(tx, ty, tw || sprCanvas.width, th || sprCanvas.height)) {

			// shift x/y based on camera
			tx = tx - this.buffer.camX;
			ty = ty - this.buffer.camY;

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
				sx || 0, // sx
				sy || 0, // sy
				sw || sprCanvas.width, // sw
				sh || sprCanvas.height, // sh
				// stretch it if w/h is given
				tx || 0,
				ty || 0,
				tw || sprCanvas.width, // default to canvas width
				th || sprCanvas.height, // default to canvas height
			);

			PerformanceTrace.drawCalls++;

			if (oldAlpha) {
				this._ctx.globalAlpha = oldAlpha;
			}
		}
	}

	grid(id, x, y) {
		// shift x/y based on camera
		x = x - this.buffer.camX;
		y = y - this.buffer.camY;

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
		// shift x/y based on camera
		x = x - this.buffer.camX;
		y = y - this.buffer.camY;

		let fontObj = this.manifest.assets.fonts[font];

		let kerningTree;
		if (useKerning) {
			kerningTree = fontObj._kerningTree;
			if (!kerningTree) {
				warn(`Kerning for was activated, though no kerning data is available for this font.`, "RenderMode.BASIC.text");
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
	 * @param {integer} w width
	 * @param {integer} h height
	 * @param {Number} alpha alpha value, ranging from 0 (invisible) to 1 (opaque)
	 */
	renderOffscreenBuffer(buffer, x, y, w, h, alpha) {
		// force flush on RAW buffer
		// this allows to render RAW buffers to a BASIC one
		if (buffer.getRenderMode() == "RAW") {
			buffer.renderer.flush();
		}

		w = w || buffer.width;
		h = h || buffer.height

		if (this._isRectangleInView(x, y, w, h)) {
			// shift x/y based on camera
			x = x - this.buffer.camX;
			y = y - this.buffer.camY;

			// check for alpha value
			let oldAlpha;
			if (alpha !== undefined) {
				oldAlpha = this._ctx.globalAlpha;
				if (oldAlpha !== alpha) {
					this._ctx.globalAlpha = alpha;
				}
			}

			// draw buffer
			this._ctx.drawImage(
				buffer._canvasDOM,
				// take the whole src sprite canvas as a base
				0, // sx
				0, // sy
				buffer.width, // sw
				buffer.height, // sh
				// stretch it if w/h is given
				x || 0,
				y || 0,
				w, // default to canvas width
				h, // default to canvas height
			);

			// reset alpha value
			if (oldAlpha) {
				this._ctx.globalAlpha = oldAlpha;
			}

			PerformanceTrace.drawCalls++;
		}
	}
}

export default Basic;