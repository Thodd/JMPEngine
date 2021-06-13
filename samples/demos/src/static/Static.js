import PIXI from "../../../../src/core/PIXIWrapper.js";
import Entity from "../../../../src/game/Entity.js";
import DemoScreen from "../DemoScreen.js";

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
		this._pixels[0] = 0xFF;
		this._pixels[1] = 0x00;
		this._pixels[2] = 0x85;
		this._pixels[3] = 255;
	}

	get(x, y) {
		return {
			r: 0xFF,
			g: 0xFF,
			b: 0xFF,
			a: 0xFF
		}
	}
}

class Static extends DemoScreen {
	constructor() {
		super();

		this.px = new PixelBuffer({
			width: 240,
			height: 144
		});
		this.add(this.px);


		// TODO: Implement PixelBuffer as low-level API in Engine package
		// TODO: Check old implementation on Canvas in GitHub --> how does the performance compare to using PIXI & WebGL?



		this.registerFrameEvent(() => {
			this.px.set();
			this.px.flush();
		},120);
	}
}

export default Static;