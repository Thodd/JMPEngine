import { fail } from "../../utils/Log.js";
import Spritesheets from "../Spritesheets.js";
import ColorTools from "../ColorTools.js";
import PerformanceTrace from "../../utils/PerformanceTrace.js";

// We can only render full-pixels in the RAW mode
// so for convenience we shorten the Math.floor() function to n(...)
const n = Math.floor;

class Raw {
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

		this.clear();
	}

	_release() {
		delete this._pixels;
	}

	/**
	 * Helpers to simplify implementation
	 */
	_pxOff(x, y) {
		return 4 * (y * this.manifest.w + x)
	}

	_copyData(source, tx, ty) {
		this._copyDataExt(source, this._pixels, tx, ty);
	}

	/**
	 * Copies the given source ImageData into the given target ImageData
	 * @param {ImageData} source
	 * @param {ImageData} target
	 * @param {integer} tx target x
	 * @param {integer} ty target y
	 * @param {number} alpha the alpha channel for the given image-data.
	 *                       The alpha value is multiplied with all alpha values in the source image-data.
	 */
	_copyDataExt(source, target, tx, ty, alpha) {
		// alpha = 1 is default
		alpha = alpha || 1;

		// shift the target coordinates based on current camera position
		// rounded to the next integer, as we can't render "subpixels" in RAW mode
		tx = Math.round(tx - this.buffer.camX);
		ty = Math.round(ty - this.buffer.camY);

		// source data
		let _sw = source.width;
		let _sh = source.height

		// target data (typically the screen's imageData)
		let _tw = target.width;
		let _th = target.height;

		let pos;
		for (let y = 0; y < _sh; y++) {
			for (let x = 0; x < _sw; x++) {
				let off = (y * _sw + x) * 4;

				PerformanceTrace.pixelsDrawn++;

				let r0 = source.data[off];
				let g0 = source.data[off+1];
				let b0 = source.data[off+2];
				let a0 = source.data[off+3];

				a0 = a0 * alpha;

				// only visible source pixels with an alpha value greater then 0 are rendered
				if (a0 > 0) {
					// check if target x/y are inside the view
					if (tx + x >= 0 && tx + x < _tw &&
						ty + y >= 0 && ty + y < _th) {
						// position is inside pixel buffer
						pos = 4 * ((ty + y) * _tw + tx + x);

						// blend alpha values if necessary
						if (a0 < 255) {
							// target colors
							let r1 = target.data[pos];
							let g1 = target.data[pos+1];
							let b1 = target.data[pos+2];
							let a1 = target.data[pos+3];

							// TODO: Blend colors if source has alpha value OR alpha value is given   ->   how?
							let finalAlpha = 255;
							if (a0 < 255 && a1 < 255) {
								finalAlpha = (a0 + a1) / 2;
							}

							// calculate average of the two colors
							target.data[pos] = (r0 * a0 + r1 * a1) / (a0 + a1);
							target.data[pos+1] = (g0 * a0 + g1 * a1) / (a0 + a1);
							target.data[pos+2] = (b0 * a0 + b1 * a1) / (a0 + a1);
							target.data[pos+3] = finalAlpha;
						} else {
							target.data[pos] = r0;
							target.data[pos+1] = g0;
							target.data[pos+2] = b0;
							target.data[pos+3] = 255;
						}
					}
				}
			}
		}
	}

	/**
	 * GFX Module API
	 */
	clear() {
		delete this._pixels;
		this._pixels = this._ctx.createImageData(this.manifest.w, this.manifest.h);
	}

	clear_rect(/* x, y, w, h */) {
		// TODO: implement clearing of a rectangle
		this.clear();
	}

	/**
	 * Translating is unsupported for the RenderMode.RAW.
	 */
	trans(x, y) {
		this.buffer.camX = -1 * x;
		this.buffer.camY = -1 * y;
	}

	save() {}

	restore() {}

	/**
	 * Flush the pixels in the Buffer to the Screen.
	 * The Screen class calls this function at the end of each frame.
	 *
	 * <b>Beware</b>: Don't call this manually. Might lead to unwanted side effects.
	 */
	flush() {
		this._ctx.putImageData(this._pixels, 0, 0);
		PerformanceTrace.drawCalls++;
	}

	/**
	 * Returns the internal ImageData object.
	 * <b>Use at your own risk!</b>
	 *
	 * You can directly manipulate each pixel's bytes.
	 * This might be useful if you need to manipulate a great number of pixels.
	 * Please check if using <code>pxSetFast()</code> is sufficient before
	 * manipulating the pixel's byte values directly.
	 *
	 * One final hint:
	 * ----------------
	 * To get the offset of a single pixel inside the data array (UInt8ClampedArray) of the ImageData object:
	 * let img = GFX.get(0).getImageData();
	 * let off = 4 * (y * img.width + x);
	 *
	 * From here on you're on your own.
	 */
	getImageData() {
		return this._pixels;
	}

	/**
	 * Renders a Pixel of the given color at coordinates (x,y).
	 *
	 * @sample
	 * pxSet(10, 20, {r: 200, g: 100, b: 0, a: 50});
	 * pxSet(10, 20, "#FF0085");
	 *
	 * @param {integer} x
	 * @param {integer} y
	 * @param {object|string} color object containing r/g/b/a values, or CSS-color string
	 */
	pxSet(x, y, color = {r: 255, g: 255, b: 255, a: 255}) {
		x = n(x - this.buffer.camX);
		y = n(y - this.buffer.camY);

		if (x < 0 || x >= this.manifest.w || y < 0 || y >= this.manifest.h) {
			// nothing to draw
			return;
		}

		let d = this._pixels;
		if (typeof color == "string") {
			color = ColorTools.parseColorString(color);
		}

		let off = this._pxOff(x, y);
		// colors
		d.data[off + 0] = color.r;
		d.data[off + 1] = color.g;
		d.data[off + 2] = color.b;

		// alpha
		d.data[off + 3] = (color.a != undefined) ? color.a : 255;

		PerformanceTrace.pixelsDrawn++;
	}

	/**
	 * Fastest public API to render a pixel.
	 *
	 * - No smoothing of coordinates!
	 * - No boundary checks!
	 * - No CSS color-string resolution!
	 *
	 * <b>Use at your own risk!</b>
	 *
	 * @param {integer} x x, must be an integer!
	 * @param {integer} y y, must be an integer!
	 * @param {integer} r red
	 * @param {integer} g green
	 * @param {integer} b blue
	 * @param {integer} a alpha
	 */
	pxSetFast(x, y, r, g, b, a) {
		x = x - this.buffer.camX;
		y = y - this.buffer.camY;

		let d = this._pixels;
		let off = 4 * (y * this.manifest.w + x);
		d.data[off + 0] = r;
		d.data[off + 1] = g;
		d.data[off + 2] = b;
		d.data[off + 3] = (a != undefined) ? a : 255;

		PerformanceTrace.pixelsDrawn++;
	}

	/**
	 * Retrieves the color information of the pixel at the given coordinates.
	 * The returned object has the following properties: r,g,b,a
	 *
	 * <b>Beware</b>: ONLY pixels on the screen can be retrieved! Unrendered pixels are practically non-existent to the renderer!
	 *
	 * @param {integer} x
	 * @param {integer} y
	 */
	pxGet(x, y) {
		x = n(x - this.buffer.camX);
		y = n(y - this.buffer.camY);

		let d = this._pixels;
		let off = this._pxOff(x, y);
		PerformanceTrace.pixelsDrawn++;
		return {
			r: d.data[off + 0],
			g: d.data[off + 1],
			b: d.data[off + 2],
			a: d.data[off + 3]
		};
	}

	/**
	 * Clears the pixel at position (x,y).
	 * @param {integer} x
	 * @param {integer} y
	 */
	pxClear(x, y){
		this.px(x, y, "rgba(0,0,0,0)");
	}

	rect(x, y, w, h, color) {
		fail("The function 'rect()' is not implemented yet.", "Renderer.RAW");
	}

	rectf(x, y, w, h, color) {
		for (let dy = y, dh = y+h; dy < dh; dy++) {
			this.line(x, dy, x+w, dy, color);
		}
	}

	circ(x, y, r, color) {
		fail("The function 'circ()' is not implemented yet.", "Renderer.RAW");
	}

	circf(x, y, r, color) {
		fail("The function 'circf()' is not implemented yet.", "Renderer.RAW");
	}

	tri(x0, y0, x1, y1, x2, y2, color) {
		fail("The function 'tri()' is not implemented yet.", "Renderer.RAW");
	}

	trif(x0, y0, x1, y1, x2, y2, color) {
		fail("The function 'trif()' is not implemented yet.", "Renderer.RAW");
	}

	poly() {}

	polyf(x1, y1, w1,    x2, y2, w2,    c) {
		let tx  = x2;
		let dtx = (x2-x1) / Math.abs(y1-y2);
		let tw  = w2;
		let dtw = (w2-w1) / Math.abs(y1-y2);


		for (let y = y2; y < y1; y++) {
			this.line(tx,y,tx+tw,y,c)
			tx -= dtx;
			tw -= dtw;
		}
	}

	line(x0, y0, x1, y1, color) {
		x0 = n(x0);
		y0 = n(y0);
		x1 = n(x1);
		let d = this._pixels;
		if (typeof color == "string") {
			color = ColorTools.parseColorString(color);
		}

		// only a horizontal line for now   -->   enough for racer sample
		for (let x = x0; x < x1; x++) {

			if (x < 0 || x >= this.manifest.w) {
				// nothing to draw
				continue;
			}

			let off = this._pxOff(x, y0);
			// colors
			d.data[off + 0] = color.r;
			d.data[off + 1] = color.g;
			d.data[off + 2] = color.b;

			// alpha
			d.data[off + 3] = 255;

			PerformanceTrace.pixelsDrawn++;
		}
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
		this.spr_ext(sheet, id, undefined, undefined, undefined, undefined, x, y, undefined, undefined, color);
	}

	/**
	 * Renders a sprite at the given coordinates.
	 * <b>Note:</b> Does not support scaling via w/h arguments!
	 *
	 * @param {string} sheet spritesheet name
	 * @param {integer} id sprite id in the sheet
	 * @param {integer} sx clipping X - unsupported!
	 * @param {integer} sy clipping Y - unsupported!
	 * @param {integer} sw clipping width - unsupported!
	 * @param {integer} sh clipping height - unsupported!
	 * @param {integer} tx draw x
	 * @param {integer} ty draw y
	 * @param {integer} tw target width - unsupported!
	 * @param {integer} th target height - unsupported!
	 * @param {string} color css color string
	 */
	spr_ext(sheet, id, sx, sy, sw, sh, tx, ty, tw, th, color, alpha) {
		tx = n(tx);
		ty = n(ty);

		let sprCanvas = Spritesheets.getCanvasFromSheet(sheet, id, color);

		// sprite dimensions
		let x1 = tx;
		let y1 = ty;
		let w1 = sprCanvas.width;
		let h1 = sprCanvas.height;

		// screen dimensions
		let x2 = this.buffer.camX;
		let y2 = this.buffer.camY;
		let w2 = this.manifest.w;
		let h2 = this.manifest.h;

		// check if sprite is in view
		if (x1 < x2 + w2 &&
			x1 + w1 > x2 &&
			y1 < y2 + h2 &&
			y1 + h1 > y2) {

			// TODO: Can this be optimized by calculating the actual visible section of the source?

			let imgData = sprCanvas._getImgDataFullSize();
			this._copyDataExt(imgData, this._pixels, tx, ty, alpha);
		}

	}

	grid(id, x, y) {
		fail("Unsupported operation 'grid(...)' for RenderMode.RAW", "Renderer.RAW");
	}

	text(font, x, y, msg, color, useKerning=false) {
		fail("Rendering of text on Buffers in RenderMode.RAW is not supported. Please use a Buffer in RenderMode.BASIC instead.", "RenderMode.RAW");
	}

	/**
	 * Renders the given offscreen Buffer instance to the screen.
	 *
	 * @param {Buffer} buffer the Buffer object.
	 * @param {Number} x target x
	 * @param {Number} y target y
	 */
	renderOffscreenBuffer(buffer, x, y) {
		if (buffer.getRenderMode() != "RAW") {
			fail("Unable to render Offscreen Buffer in RenderMode.BASIC into Buffer in RenderMode.RAW.", "RenderMode.RAW");
		}
		this._copyData(buffer.renderer._pixels, x, y);
	}
}

export default Raw;