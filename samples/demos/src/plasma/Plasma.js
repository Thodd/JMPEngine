import Engine from "../../../../src/core/Engine.js";
import PixelBuffer from "../../../../src/game/PixelBuffer.js";

import ColorPalette from "../ColorPalette.js";
import DemoScreen from "../DemoScreen.js";

const COLORS =
[
	ColorPalette.asRGBA[0],
	ColorPalette.asRGBA[2],
	ColorPalette.asRGBA[8],
	ColorPalette.asRGBA[9],
	ColorPalette.asRGBA[10],
	ColorPalette.asRGBA[11],
	ColorPalette.asRGBA[12],
	ColorPalette.asRGBA[13],
	ColorPalette.asRGBA[14],
	ColorPalette.asRGBA[15]
];
const COLOR_COUNT = COLORS.length;

const STYLE_FN = [
	function(x, y) {
		return 1;
	},
	function(x, y) {
		return Math.abs(Math.tan(x + y)); // looks nice without negative values
	},
	function(x, y) {
		return Math.atan(x + y);
	},
	function(x, y) {
		return Math.cos(x * y);
	},
	function(x, y) {
		return Math.cos(x + y);
	},
	function(x, y) {
		return Math.cos(x + x);
	},
	function(x, y) {
		return Math.tan(x * y);
	},
	function(x, y) {
		return Math.cos(x - y);
	},
	function(x, y) {
		return Math.cos(y + y);
	},
	function(x, y) {
		return Math.cos(Math.exp(x, y));
	}
];
let STYLE_FN_COUNT = STYLE_FN.length;


class Plasma extends DemoScreen {
	constructor() {
		super();

		this.px = new PixelBuffer({
			width: 240,
			height: 144
		});
		this.add(this.px);

		this.styleFnIndex = 0;
		this.styleFn = STYLE_FN[this.styleFnIndex];
		this.styleChangeReady = true;
	}

	cycleStyle() {
		// prevent too much style changes, only 1 per second
		if (this.styleChangeReady) {
			this.styleFnIndex++;
			if (this.styleFnIndex == STYLE_FN_COUNT) {
				this.styleFnIndex = 0;
			}
			this.styleFn = STYLE_FN[this.styleFnIndex];

			this.styleChangeReady = false;
			this.registerFrameEvent(() => {
				this.styleChangeReady = true;
			}, 60);
		}
	}

	update() {
		this.px.clearDither(4000, COLORS[0]);

		let t = Engine.nowSeconds() / 2;

		// simple wave along the time
		let tWave = Math.sin(t);

		let zoom = 32;

		for (let x = 0; x < 240; x++) {
			for (let y = 0; y < 144; y++) {
				let i = x / zoom;
				let j = y / zoom;

				// plasma base (tweaked to produce somewhat intereseting patterns)
				let colorIndex = j * Math.sin(i + t) + i * Math.cos(j + t) - tWave * 12  * Math.sin(j/2 + 0.5 * t);

				// add a dedicated style function on top of the plasma base
				// the style functions correlate depend on x and y
				if (tWave <= 0.01 && tWave >= -0.01) {
					this.cycleStyle();
				}
				colorIndex =colorIndex + this.styleFn(x, y) * tWave;

				if (colorIndex > 0) {
					// the color index is correlated to the passed time, this shifts the colors gradually from inside out
					let cdx = (t + 0.5 * colorIndex)|0;
					let c = COLORS[cdx % COLOR_COUNT];
					this.px.set(x, y, c.r, c.g, c.b, c.a);
				}
			}
		}
		this.px.flush();
	}
}

export default Plasma;