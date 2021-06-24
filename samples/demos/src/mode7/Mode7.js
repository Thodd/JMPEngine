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

		this.projectionValues = {
			focalLength: 399,
			horizon: 73,
			scale: 31
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
		bgGfx.drawRect(0, 48, 240, 36);
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
   [<c=${ColorPalette.asString[8]}>ALT</c>]    : hold to strafe
 [<c=${ColorPalette.asString[8]}>Q</c>] / [<c=${ColorPalette.asString[8]}>A</c>]  : shift far plane
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
		}, 180);
	}

	end() {
		super.end();

		this.cancelFrameEvent(this.helpTimer);
		this.cancelFrameEvent(this.helpFadeInterval);
	}

	/**
	 * You can find a very good overview of the basic concept here:
	 * https://www.coranac.com/tonc/text/mode7.htm
	 * https://fenixfox-studios.com/content/mode_7/
	 *
	 * Basic projection:
	 * x' = x / z
	 * y' = y / z
	 */
	update() {
		// camera controls
		if (Keyboard.wasPressedOrIsDown(Keys.LEFT)) {
			if (Keyboard.wasPressedOrIsDown(Keys.ALT)) {
				// "horizontal" strafing
				this.camera.x += Math.sin(this.camera.angle - (90 * Math.PI / 180)) * 2;
				this.camera.y -= Math.cos(this.camera.angle - (90 * Math.PI / 180)) * 2;
			} else {
				// camera is circling around the center
				this.camera.angle -= 0.025;
				this.camera.x += Math.sin(this.camera.angle + (90 * Math.PI / 180)) * 2;
				this.camera.y -= Math.cos(this.camera.angle + (90 * Math.PI / 180)) * 2;
			}
		} else if (Keyboard.wasPressedOrIsDown(Keys.RIGHT)) {
			if (Keyboard.wasPressedOrIsDown(Keys.ALT)) {
				// "horizontal" strafing
				this.camera.x -= Math.sin(this.camera.angle - (90 * Math.PI / 180)) * 2;
				this.camera.y += Math.cos(this.camera.angle - (90 * Math.PI / 180)) * 2;
			} else {
				// camera is circling around the center
				this.camera.angle += 0.025;
				this.camera.x -= Math.sin(this.camera.angle + (90 * Math.PI / 180)) * 2;
				this.camera.y += Math.cos(this.camera.angle + (90 * Math.PI / 180)) * 2;
			}
		}

		if (Keyboard.wasPressedOrIsDown(Keys.UP)) {
			this.camera.x += Math.sin(this.camera.angle) * 2;
			this.camera.y -= Math.cos(this.camera.angle) * 2;
		} else if (Keyboard.wasPressedOrIsDown(Keys.DOWN)) {
			this.camera.x -= Math.sin(this.camera.angle) * 2;
			this.camera.y += Math.cos(this.camera.angle) * 2;
		}

		if (Keyboard.wasPressedOrIsDown(Keys.Q)) {
			this.projectionValues.focalLength += 1;
		} else if (Keyboard.wasPressedOrIsDown(Keys.A)) {
			this.projectionValues.focalLength -= 1;
		}

		if (Keyboard.wasPressedOrIsDown(Keys.E)) {
			this.projectionValues.scale += 1;
		} else if (Keyboard.wasPressedOrIsDown(Keys.D)) {
			this.projectionValues.scale -= 1;
		}

		// clearDither creates a nice fire effect on the edges of the map
		this.px.clearDither(4000, ColorPalette.asRGBA[1]);

		// the cos and sin of the camera angle don't change while scanlining
		// and can be calculted outside the loops
		let cosCamera = Math.cos(this.camera.angle);
		let sinCamera = Math.sin(this.camera.angle);

		for(let y = -HEIGHT_HALF; y < HEIGHT_HALF; y++) {
			let dy = y + HEIGHT_HALF;

			if (y >= (-HEIGHT_HALF)) {
				for (let x = -WIDTH_HALF; x < WIDTH_HALF; x++) {
					let dx = x + WIDTH_HALF;

					// projection
					let px = x;
					let py = y + this.projectionValues.focalLength;
					let pz = y + this.projectionValues.horizon;

					let worldPoint = {
						x: px / pz,
						y: py / pz
					};

					// world -> screen -> sample coords
					let screenPoint = {
						x: worldPoint.x * cosCamera + worldPoint.y * sinCamera,
						y: worldPoint.x * sinCamera - worldPoint.y * cosCamera
					};

					let samplePoint = {
						x: screenPoint.x * this.projectionValues.scale + this.camera.x,
						y: screenPoint.y * this.projectionValues.scale + this.camera.y
					};

					// absolute values & flooring to enable sampling
					// decimal values cannot be used as indices in Uint8Arrays (inside PixelBuffer)
					samplePoint.x = (samplePoint.x < 0 ? samplePoint.x * -1 : samplePoint.x) | 0;
					samplePoint.y = (samplePoint.y < 0 ? samplePoint.y * -1 : samplePoint.y) | 0;

					this.px.copyPixel(dx, dy, this.source.buffer, samplePoint.x, samplePoint.y);
				}
			}
		}
	}
}

export default Mode7;