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

		this._pixels = new ImageData(this.manifest.w, this.manifest.h);

		this.camX = 0;
		this.camY = 0;
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
	 */
	_copyDataExt(source, target, tx, ty) {
		// shift the target coordinates based on current camera position
		tx = tx - this.camX;
		ty = ty - this.camY;

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

				let r = source.data[off];
				let g = source.data[off+1];
				let b = source.data[off+2];
				let a = source.data[off+3];

				if (a > 0) { // only opaque pixels are rendered
					// check if target x/y are inside the view
					if (tx + x >= 0 && tx + x < _tw &&
						ty + y >= 0 && ty + y < _th) {
						// position is inside pixel buffer
						pos = 4 * ((ty + y) * _tw + tx + x);

						target.data[pos] = r;
						target.data[pos+1] = g;
						target.data[pos+2] = b;
						target.data[pos+3] = a;
						PerformanceTrace.pixelsDrawn++;
					}
				}
			}
		}
	}

	/**
	 * GFX Module API
	 */
	clear(color) {
		if (color) {
			this._canvasDOM.style.background = color;
		}
		delete this._pixels;
		this._pixels = new ImageData(this.manifest.w, this.manifest.h);
	}

	clear_rect(color, /* x, y, w, h */) {
		// TODO: implement clearing of a rectangle
		this.clear(color);
	}

	/**
	 * Translating is unsupported for the RenderMode.RAW.
	 */
	trans(x, y) {
		this.camX = -1 * x;
		this.camY = -1 * y;
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
	pxSet(x, y, color) {
		x = n(x - this.camX);
		y = n(y - this.camY);

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
	 * Retrieves the color information of the pixel at the given coordinates.
	 * The returned object has the following properties: r,g,b,a
	 *
	 * <b>Beware</b>: ONLY pixels on the screen can be retrieved! Unrendered pixels are practically non-existent to the renderer!
	 *
	 * @param {integer} x
	 * @param {integer} y
	 */
	pxGet(x, y) {
		x = n(x - this.camX);
		y = n(y - this.camY);

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
		fail("The function 'rectf()' is not implemented yet.", "Renderer.RAW");
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

	line(x0, y0, x1, y1, color) {
		fail("The function 'line()' is not implemented yet.", "Renderer.RAW");
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
		this.spr_ext(sheet, id, x, y, undefined, undefined, color);
	}

	/**
	 * Renders a sprite at the given coordinates.
	 * <b>Note:</b> Does not support scaling via w/h arguments!
	 *
	 * @param {string} sheet spritesheet name
	 * @param {integer} id sprite id in the sheet
	 * @param {integer} x draw x
	 * @param {integer} y draw y
	 * @param {integer} w unsupported!
	 * @param {integer} h unsupported!
	 * @param {string} color css color string
	 */
	spr_ext(sheet, id, x, y, w, h, color) {
		x = n(x);
		y = n(y);

		let sprCanvas = Spritesheets.getCanvasFromSheet(sheet, id, color);

		// sprite dimensions
		let x1 = x;
		let y1 = y;
		let w1 = sprCanvas.width;
		let h1 = sprCanvas.height;

		// screen dimensions
		let x2 = this.camX;
		let y2 = this.camY;
		let w2 = this.manifest.w;
		let h2 = this.manifest.h;

		// check if sprite is in view
		if (x1 < x2 + w2 &&
			x1 + w1 > x2 &&
			y1 < y2 + h2 &&
			y1 + h1 > y2) {

			let imgData = sprCanvas._getImgDataFullSize();
			this._copyDataExt(imgData, this._pixels, x, y);
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