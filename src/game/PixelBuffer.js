import PIXI from "../core/PIXIWrapper.js";
import Entity from "./Entity.js";

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

		let off = 4 * (y * this._width + x);

		this._pixels[off+0] = r;
		this._pixels[off+1] = g;
		this._pixels[off+2] = b;
		this._pixels[off+3] = a != undefined ? a : 0xFF;
	}

	get(x, y) {
		let off = 4 * (y * this._width + x);
		return {
			r: this._pixels[off+0],
			g: this._pixels[off+1],
			b: this._pixels[off+2],
			a: this._pixels[off+3]
		}
	}
}

export default PixelBuffer;