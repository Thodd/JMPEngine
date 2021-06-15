import PixelBuffer from "../../../../src/game/PixelBuffer.js";
import ColorPalette from "../ColorPalette.js";
import DemoScreen from "../DemoScreen.js";

const COLOR_SKY = ColorPalette.asRGBA[8];
const COLOR_SUN = ColorPalette.asRGBA[9];
const COLOR_WAVES = ColorPalette.asRGBA[2];

class Sunset extends DemoScreen {
	constructor() {
		super();

		this.px = new PixelBuffer({width: 240, height: 144});
		this.add(this.px);

		// setup
		this.px.clear(COLOR_SKY);
		this.px.fillCircle(77, 77, 20, COLOR_SUN);
		this.px.fillRect(0, 77, 240, 77, COLOR_WAVES);
	}

	update() {

	}
}

export default Sunset;