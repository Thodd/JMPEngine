import PixelBuffer from "../../../../src/game/PixelBuffer.js";
import ColorPalette from "../ColorPalette.js";
import DemoScreen from "../DemoScreen.js";

class Static extends DemoScreen {
	constructor() {
		super();

		this.px = new PixelBuffer({
			width: 240,
			height: 144
		});
		this.add(this.px);
	}

	update() {
		for (let x = 0; x < this.px._width; x++) {
			for (let y = 0; y < this.px._height; y++) {
				let colorIndex = Math.random() * ColorPalette.count;
				let color = ColorPalette.asRGBA[colorIndex | 0];
				this.px.set(x, y, color.r, color.g, color.b, color.a);
			}
		}
		this.px.flush();
		this.px._updateRenderInfos();
	}
}

export default Static;