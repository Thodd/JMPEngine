import PIXI from "../core/PIXIWrapper.js";
import Entity from "./Entity.js";
import { bresenham } from "../utils/M4th.js";
import Spritesheets from "../assets/Spritesheets.js";
import { fail } from "../utils/Log.js";

/**
 * Special Class to render pixels.
 * The PixelBuffer is the lowest level GFX API the JMP Engine provides.
 * Only allows for single pixel manipulation.
 * Use with caution.
 * Primitives, lines etc. should be rendered via a PIXI.Graphics instance.
 */
class PixelBuffer extends Entity {
	constructor({width=240, height=144}) {
		super();

		this._width = width;
		this._height = height;

		this._pixels = new Uint8Array(4*width*height);

		this._texture = PIXI.Texture.from(this._pixels, { resourceOptions: { width: width, height: height } });
		this.configSprite({
			texture: this._texture
		});
	}

	get width() {
		return this._width;
	}

	get height() {
		return this._height;
	}

	_updateRenderInfos() {
		if (this._isDirty) {
			this._texture.update();
		}
	}

	/**
	 * Returns the internal Uint8Array instance.
	 * Each pixel is a set of 4 byte values: R, G, B, A (in this order).
	 * Use at your own risk.
	 *
	 * IMPORTANT: Call flush() to upload the changes to the GPU in the next frame.
	 */
	getRawPixels() {
		return this._pixels;
	}

	/**
	 * Upload all changes to the GPU.
	 */
	flush() {
		this._isDirty = true;
	}

	set(x, y, r, g, b, a) {
		if (x < 0 || y < 0 || x >= this._width || y >= this._height) {
			return;
		}

		if (typeof r === "object") {
			let color = r;
			r = color.r;
			g = color.g;
			b = color.b;
			a = color.a;
		}

		let off = 4 * (y * this._width + x);

		this._pixels[off+0] = r;
		this._pixels[off+1] = g;
		this._pixels[off+2] = b;
		this._pixels[off+3] = a != undefined ? a : 0xFF;

		this._isDirty = true;
	}

	get(x, y) {
		if (x < 0 || y < 0 || x >= this._width || y >= this._height) {
			return ;
		}

		let off = 4 * (y * this._width + x);
		return {
			r: this._pixels[off+0],
			g: this._pixels[off+1],
			b: this._pixels[off+2],
			a: this._pixels[off+3]
		}
	}

	clear(r, g, b, a) {
		if (typeof r === "object") {
			let color = r;
			r = color.r;
			g = color.g;
			b = color.b;
			a = color.a;
		}

		for (let x = 0; x < this._width; x++) {
			for (let y = 0; y < this._height; y++) {
				let off = 4 * (y * this._width + x);
				this._pixels[off+0] = r;
				this._pixels[off+1] = g;
				this._pixels[off+2] = b;
				this._pixels[off+3] = a != undefined ? a : 0xFF;
			}
		}

		this._isDirty = true;
	}

	clearDither(n, r, g, b, a) {
		for (let i = 0; i < n; i++) {
			let x = Math.random() * this._width | 0;
			let y = Math.random() * this._height | 0;
			this.set(x, y, r, g, b, a);
		}
	}

	fillCircle(centerX, centerY, radius, r, g, b, a) {
		// iterate the containing square around the circle
		// but only fill the pixels which fulfil "dx^2 + dy^2 <= r^2"
		for(let dy = -radius; dy <= radius; dy++) {
			for(let dx = -radius; dx <= radius; dx++) {
				if((dx * dx) + (dy * dy) <= (radius * radius) + (radius * 0.6)) {
					this.set(centerX + dx, centerY + dy, r, g, b, a);
				}
			}
		}
	}

	fillRect(x, y, w, h, r, g, b, a) {
		for (let dx = x; dx < x + w; dx++) {
			for (let dy = y; dy < y + h; dy++) {
				this.set(dx, dy, r, g, b, a);
			}
		}
	}

	ditherRect(x, y, w, h, n, r, g, b, a) {
		for (let i = 0; i < n; i++) {
			let dx = x + Math.random() * w | 0;
			let dy = y + Math.random() * h | 0;
			this.set(dx, dy, r, g, b, a);
		}
	}

	line(x0, y0, x1, y1, r, g, b, a) {
		if (x0 == x1 && y0 == y1) {
			return [];
		}
		let points = bresenham(x0, y0, x1, y1);
		let len = points.length;
		for (let p of points) {
			this.set(p.x, p.y, r, g, b, a);
		}
	}

	/**
	 * Fast pixel sample copy operation.
	 * Copies a pixel from the given source PixelBuffer 'buf'
	 * to this PixelBuffer instance.
	 *
	 * @param {int} tx target x in this PixelBuffer
	 * @param {int} ty target y in this PixelBuffer
	 * @param {PixelBuffer} buf source buffer from where to copy
	 * @param {int} sx source x in the source PixelBuffer 'buf'
	 * @param {int} sy source y in the source PixelBuffer 'buf
	 */
	copyPixel(tx, ty, srcBuf, sx, sy) {
		// check pixel bounds
		if (sx < 0 || sy < 0 || sx >= srcBuf._width || sy >= srcBuf._height ||
			tx < 0 || ty < 0 || tx >= this._width || ty >= this._height) {
				return;
		}
		const t_off = 4 * (ty * this._width + tx);
		const s_off = 4 * (sy * srcBuf._width + sx);
		this._pixels[t_off + 0] = srcBuf._pixels[s_off + 0];
		this._pixels[t_off + 1] = srcBuf._pixels[s_off + 1];
		this._pixels[t_off + 2] = srcBuf._pixels[s_off + 2];
		this._pixels[t_off + 3] = srcBuf._pixels[s_off + 3];
	}
}

/**
 * Creates a new PixelBuffer instance from the given spritesheet.
 *
 * @param {string} sheetName the name of the spritesheet
 * @returns PixelBuffer
 */
PixelBuffer.fromSpritesheet = function(sheetName) {
	const sheet = Spritesheets.getSheet(sheetName);

	if (sheet) {
		const cnvs = document.createElement("canvas");
		const w = sheet.rawImage.width;
		const h = sheet.rawImage.height;
		cnvs.width = w;
		cnvs.height = h;
		const ctx = cnvs.getContext("2d");
		ctx.drawImage(sheet.rawImage, 0, 0);

		const px = new PixelBuffer({width: w, height: h});
		px._pixels = ctx.getImageData(0, 0, w, h).data;
		return px;
	} else {
		fail(`Spritesheet ${sheetName} not found!`, "PixelBuffer");
	}
};

export default PixelBuffer;