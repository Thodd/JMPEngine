import Engine from "../../../../src/core/Engine.js";
import PixelBuffer from "../../../../src/game/PixelBuffer.js";
import RNG from "../../../../src/utils/RNG.js";
import ColorPalette from "../ColorPalette.js";
import DemoScreen from "../DemoScreen.js";

const COLOR_SKY = ColorPalette.asRGBA[8];
const COLOR_SUN = ColorPalette.asRGBA[9];
const COLOR_WATER = ColorPalette.asRGBA[2];

function isSameColor(ca, cb) {
	if (ca.r == cb.r &&
		ca.g == cb.g &&
		ca.b == cb.b &&
		ca.a == cb.a) {
			return true;
		}
	return false;
}

class Sunset extends DemoScreen {
	constructor() {
		super();

		this.px = new PixelBuffer({width: 240, height: 144});
		this.add(this.px);

		this.sun = {
			x: 76,
			y: 76,
			radius: 30
		};

		this.frameCount = 0;

		// basic scene
		this.px.clear(COLOR_SKY);
		this.px.fillRect(0, 77, 240, 77, COLOR_WATER);
		//this.px.line(0, 77, 240, 77, COLOR_SUN);
		this.px.fillCircle(this.sun.x, this.sun.y, this.sun.radius, COLOR_SUN);

		// precalculate lines for sun reflection
		this.sunLines = [];
		for (let y = this.sun.y + 1; y <= this.sun.y + this.sun.radius; y++) {
			let startX;
			let lineLength = 0;
			for (let x = 0; x < 240; x++) {
				let c = this.px.get(x, y);
				if (isSameColor(c, COLOR_SUN)) {
					startX = startX || x; // track start X
					lineLength++;
				}
			}
			if (startX >= 0) {
				this.sunLines.push({ x: startX, length: lineLength });
			}
		}
	}

	update() {
		this.frameCount = Engine.nowSeconds()*2;

		// clear water
		this.px.fillRect(0, this.sun.y, 240, 100, COLOR_WATER);
		// sun reflection
		let startY = this.sun.y;
		for (let i = 0; i < this.sunLines.length; i++) {
			let shift = 4 * Math.sin((this.frameCount + i));
			let line = this.sunLines[i];
			let startX = (line.x + shift) | 0;
			this.px.line(startX, startY + i, startX + line.length -1, startY + i, COLOR_SUN);
		}
		// waves
		RNG.seed(1337);
		for (let y = this.sun.y+1; y < 144; y++) {
			for (let x = 0; x < 240; x++) {
				if (RNG.random() < 0.1) {
					let length = (RNG.random() * 10) | 0;

					if (length > 0) {
						let startX = (x + this.frameCount*20|0) % 250 - 10;
						this.px.line(startX, y, startX + length, y, COLOR_SKY);

						// TODO: clip pixels outside the buffer (don't wrap!)
						// TODO: loop for lines  ->  Check COLOR  ->  sun reflection is darker

					}
				}
			}
		}
	}
}

export default Sunset;