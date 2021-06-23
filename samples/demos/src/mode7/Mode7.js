import PIXI from "../../../../src/core/PIXIWrapper.js";
import Entity from "../../../../src/game/Entity.js";
import BitmapText from "../../../../src/game/BitmapText.js";
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

		this.camera = {
			x: 124,
			y: 10,
			angle: 0
		};

		this.projValues = {
			focalLength: 399,
			horizon: 73,
			scale: 31
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

		// help text
		let bgGfx = new PIXI.Graphics();
		bgGfx.beginFill(ColorPalette.asInt[1]);
		bgGfx.drawRect(0, 48, 240, 28);
		bgGfx.endFill();
		this.helpBG = new Entity();
		this.helpBG.layer = 1;
		this.helpBG.configSprite({ replaceWith: bgGfx });
		this.add(this.helpBG);

		this.helpText = new BitmapText({
			x: 4,
			y: 50,
			font: "font1",
			text:
`[<c=${ColorPalette.asString[8]}>Arrow-Keys</c>]: move & rotate
 [<c=${ColorPalette.asString[8]}>Q</c>] / [<c=${ColorPalette.asString[8]}>A</c>]  : focal length
 [<c=${ColorPalette.asString[8]}>E</c>] / [<c=${ColorPalette.asString[8]}>D</c>]  : camera height`
		});
		this.helpText.layer = 2;
		this.add(this.helpText);
	}

	begin() {
		super.begin();

		this.helpText.alpha = 1;
		this.helpBG.alpha = 1;

		this.helpTimer = this.registerFrameEvent(() => {
			this.helpFadeInterval = this.registerFrameEventInterval(() => {
				this.helpText.alpha -= 0.1;
				this.helpBG.alpha -= 0.1;

				if (this.helpText.alpha < 0) {
					this.cancelFrameEvent(this.helpFadeInterval);
				}
			}, 5);
		}, 120);
	}

	end() {
		super.end();

		this.cancelFrameEvent(this.helpTimer);
		this.cancelFrameEvent(this.helpFadeInterval);
	}

	/**
	 * You can find a very good overview of the basic concept here:
	 * https://fenixfox-studios.com/content/mode_7/
	 */
	update() {
		// camera controls
		if (Keyboard.wasPressedOrIsDown(Keys.LEFT)) {
			this.camera.angle -= 0.025;
		} else if (Keyboard.wasPressedOrIsDown(Keys.RIGHT)) {
			this.camera.angle += 0.025;
		}

		if (Keyboard.wasPressedOrIsDown(Keys.UP)) {
			this.camera.x += Math.sin(this.camera.angle) * 2;
			this.camera.y -= Math.cos(this.camera.angle) * 2;
		} else if (Keyboard.wasPressedOrIsDown(Keys.DOWN)) {
			this.camera.x -= Math.sin(this.camera.angle) * 2;
			this.camera.y += Math.cos(this.camera.angle) * 2;
		}

		if (Keyboard.wasPressedOrIsDown(Keys.Q)) {
			this.projValues.focalLength += 1;
		} else if (Keyboard.wasPressedOrIsDown(Keys.A)) {
			this.projValues.focalLength -= 1;
		}

		if (Keyboard.wasPressedOrIsDown(Keys.E)) {
			this.projValues.scale += 1;
		} else if (Keyboard.wasPressedOrIsDown(Keys.D)) {
			this.projValues.scale -= 1;
		}

		this.px.clear(ColorPalette.asRGBA[1]);

		for(let y = -HEIGHT_HALF; y < HEIGHT_HALF; y++) {
			let dy = y + HEIGHT_HALF;

			if (y >= (-HEIGHT_HALF)) {
				for (let x = -WIDTH_HALF; x < WIDTH_HALF; x++) {
					let dx = x + WIDTH_HALF;

					// projection
					let px = x;
					let py = y + this.projValues.focalLength;
					let pz = y + this.projValues.horizon;

					let space_x = px / pz;
					let space_y = py / -pz;

					// space -> screen -> sample coords
					let screen_x = space_x * Math.cos(this.camera.angle) - space_y * Math.sin(this.camera.angle);
					let screen_y = space_x * Math.sin(this.camera.angle) + space_y * Math.cos(this.camera.angle);
					let sample_x = screen_x * this.projValues.scale + this.camera.x;
					let sample_y = screen_y * this.projValues.scale + this.camera.y;

					sample_x = (sample_x < 0 ? sample_x * -1 : sample_x) | 0;
					sample_y = (sample_y < 0 ? sample_y * -1 : sample_y) | 0;

					this.px.copyPixel(dx, dy, this.source.buffer, sample_x, sample_y);
				}
			}
		}
	}

	/**
	 * And another great implementation (and I believe more versatile) is by javidx9:
	 * https://www.youtube.com/watch?v=ybLZyY655iY
	 */
	updateJavidx9() {
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

		for (let y = 0; y < HEIGHT; y++) {
			let sampleDepth = y / HEIGHT; // normalize

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
					this.px.set(x, y, rgba);
				} else {
					// outside map, no sample found
					this.px.set(x, y, ColorPalette[0]);
				}
			}
		}

		// camera controls
		if (Keyboard.wasPressedOrIsDown(Keys.LEFT)) {
			if (Keyboard.wasPressedOrIsDown(Keys.ALT)) {
				this.camera.x -= Math.cos(this.camera.angle) * 0.0025;
				this.camera.y += Math.sin(this.camera.angle) * 0.0025;
			} else {
				this.camera.angle -= 0.025;
			}
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
			this.frustum.far += 0.0025;
		} else if (Keyboard.wasPressedOrIsDown(Keys.S)) {
			this.frustum.far -= 0.0025;
		}

		if (Keyboard.wasPressedOrIsDown(Keys.E)) {
			this.frustum.fov += 0.005;
		} else if (Keyboard.wasPressedOrIsDown(Keys.D)) {
			this.frustum.fov -= 0.005;
		}
	}
}

export default Mode7;