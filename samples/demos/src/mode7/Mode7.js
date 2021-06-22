import PixelBuffer from "../../../../src/game/PixelBuffer.js";
import Keyboard from "../../../../src/input/Keyboard.js";
import Keys from "../../../../src/input/Keys.js";

import ColorPalette from "../ColorPalette.js";
import DemoScreen from "../DemoScreen.js";

const WIDTH = 240;
const WIDTH_HALF = WIDTH / 2;
const HEIGHT = 144;
const HEIGHT_HALF = HEIGHT / 2;

class Mode7 extends DemoScreen {
	constructor() {
		super();

		this.px = new PixelBuffer({width: 240, height: 144});
		this.add(this.px);

		this.frameCount = 0;

		// this.camera = {
		// 	x: -this.source.w / 2,
		// 	y: this.source.h / 2,
		// 	z: 15
		// };
		// this.horizon = 44;
		// this.th = -320 * Math.PI;

		this.camera = {
			x: 0,
			y: 0,
			angle: 0
		};

		this.frustum = {
			near: 0.01,
			far: 0.1,
			fov: Math.PI / 4
		};


		// we create a pixel buffer from a source texture to access single pixels
		const sourceBuffer = PixelBuffer.fromSpritesheet("track");
		this.source = {
			buffer: sourceBuffer,
			w: sourceBuffer.width,
			h: sourceBuffer.height
		};

		// this.source = this.createGrid(1024, 1024);
	}

	createGrid(w, h) {
		let grid = new PixelBuffer({
			width: w,
			height: h
		});

		for (let x = 0; x < w; x += 32) {
			for (let y = 0; y < h; y += 1) {
				grid.set(x + 0, y, ColorPalette.asRGBA[8]);
				grid.set(x + 1, y, ColorPalette.asRGBA[8]);
				grid.set(x - 1, y, ColorPalette.asRGBA[8]);

				grid.set(y, x + 0, ColorPalette.asRGBA[12]);
				grid.set(y, x + 1, ColorPalette.asRGBA[12]);
				grid.set(y, x - 1, ColorPalette.asRGBA[12]);
			}
		}

		return {
			buffer: grid,
			w: w,
			h: h
		};
	}

	update() {
		this.px.clear(ColorPalette.asRGBA[1]);

		let far1 = {
			x: this.camera.x + Math.cos(this.camera.angle - this.frustum.fov) * this.frustum.far,
			y: this.camera.y + Math.sin(this.camera.angle - this.frustum.fov) * this.frustum.far
		};
		let far2 = {
			x: this.camera.x + Math.cos(this.camera.angle + this.frustum.fov) * this.frustum.far,
			y: this.camera.y + Math.sin(this.camera.angle + this.frustum.fov) * this.frustum.far
		};

		let near1 = {
			x: this.camera.x + Math.cos(this.camera.angle - this.frustum.fov) * this.frustum.near,
			y: this.camera.y + Math.sin(this.camera.angle - this.frustum.fov) * this.frustum.near
		};
		let near2 = {
			x: this.camera.x + Math.cos(this.camera.angle + this.frustum.fov) * this.frustum.near,
			y: this.camera.y + Math.sin(this.camera.angle + this.frustum.fov) * this.frustum.near
		};

		for (let y = 0; y < HEIGHT_HALF; y++) {
			let sampleDepth = y / HEIGHT_HALF; // normalize

			let scanStart = {
				x: (far1.x - near1.x) / sampleDepth + near1.x,
				y: (far1.y - near1.y) / sampleDepth + near1.y
			}
			let scanEnd = {
				x: (far2.x - near2.x) / sampleDepth + near2.x,
				y: (far2.y - near2.y) / sampleDepth + near2.y
			}

			for (let x = 0; x < WIDTH; x++) {
				let sampleWidth = x / WIDTH;
				let sample = {
					x: (scanEnd.x - scanStart.x) * sampleWidth + scanStart.x,
					y: (scanEnd.y - scanStart.y) * sampleWidth + scanStart.y
				};

				sample.x %= 1;
				sample.y %= 1;

				let rgba;
				if (isNaN(sample.x) || isNaN(sample.y)) {
					rgba = ColorPalette.asRGBA[11]; // green
				} else {
					rgba = this.source.buffer.sample(sample.x, sample.y);
				}

				if (rgba) {
					this.px.set(x, y + HEIGHT_HALF, rgba);
				} else {
					// outside map, no sample found
					this.px.set(x, y + HEIGHT_HALF, ColorPalette[0]);
				}
			}
		}

		// camera controls
		if (Keyboard.wasPressedOrIsDown(Keys.LEFT)) {
			this.camera.angle -= 0.025;
		} else if (Keyboard.wasPressedOrIsDown(Keys.RIGHT)) {
			this.camera.angle += 0.025;
		}
		if (Keyboard.wasPressedOrIsDown(Keys.UP)) {
			this.camera.x += Math.cos(this.camera.angle) * 0.0025;
			this.camera.y += Math.sin(this.camera.angle) * 0.0025;
		} else if (Keyboard.wasPressedOrIsDown(Keys.DOWN)) {
			this.camera.x -= Math.cos(this.camera.angle) * 0.0025;
			this.camera.y -= Math.sin(this.camera.angle) * 0.0025;
		}

		if (Keyboard.wasPressedOrIsDown(Keys.Q)) {
			this.frustum.near += 0.005;
		} else if (Keyboard.wasPressedOrIsDown(Keys.A)) {
			this.frustum.near -= 0.005;
		}

		if (Keyboard.wasPressedOrIsDown(Keys.W)) {
			this.frustum.far += 0.005;
		} else if (Keyboard.wasPressedOrIsDown(Keys.S)) {
			this.frustum.far -= 0.005;
		}

		if (Keyboard.wasPressedOrIsDown(Keys.E)) {
			this.frustum.fov += 0.005;
		} else if (Keyboard.wasPressedOrIsDown(Keys.D)) {
			this.frustum.fov -= 0.005;
		}
	}
}

export default Mode7;