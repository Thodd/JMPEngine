import PixelBuffer from "../../../../src/game/PixelBuffer.js";
import Keyboard from "../../../../src/input/Keyboard.js";
import Keys from "../../../../src/input/Keys.js";
import ColorPalette from "../ColorPalette.js";
import DemoScreen from "../DemoScreen.js";

const WIDTH = 240;
const HEIGHT = 144;

const COLOR_CLEAR = ColorPalette.asRGBA[1];

const OFFSET = {
	x: 70,
	y: 40
};

class Flag extends DemoScreen {
	constructor() {
		super();

		// we create a pixel buffer from a source texture to access single pixels
		const sourceBuffer = PixelBuffer.fromSpritesheet("flag");
		this.source = {
			buffer: sourceBuffer,
			w: sourceBuffer.width,
			h: sourceBuffer.height
		};

		// render buffer
		this.px = new PixelBuffer({
			width: WIDTH,
			height: HEIGHT
		});
		this.add(this.px);

		// frame count
		this.dt = 0;
	}

	update() {
		this.dt++;

		this.px.clearDither(4000, COLOR_CLEAR);

		// sample x' = sin(x + dt)
		//        y' = cos(y + dt)
		// x,y min and max values overscan the texture to allow for "frizzy" edges
		for (let y = -10; y < this.source.h + 15; y++) {
			let xShift = 10 * Math.sin((y + this.dt) / 20) | 0;
			for (let x = -10; x < this.source.w + 15; x++) {
				let yShift = 10 * Math.cos((x + this.dt) / 20) | 0;
				this.px.copyPixel(OFFSET.x + x, OFFSET.y + y, this.source.buffer, x + xShift, y + yShift);
			}
		}

		if (Keyboard.wasPressedOrIsDown(Keys.ENTER)) {
			this.dt++;
		}
	}
}

export default Flag;