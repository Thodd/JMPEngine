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

		this.frameCount = 0;
	}

	update() {
		for (let x = 0; x < this.px._width; x++) {
			for (let y = 0; y < this.px._height; y++) {
				let colorIndex = Math.random() * ColorPalette.count;
				let color = ColorPalette.asRGBA[colorIndex | 0];
				this.px.set(x, y, color);
			}
		}
		// scanline
		this.frameCount = (this.frameCount + 1) % 144;
		this.px.line(0, this.frameCount, 240, this.frameCount, ColorPalette.asRGBA[0]);
		for (let i = 0; i < 240; i++) {
			if (Math.random() <= 0.6) {
				let colorIndex = Math.random() * ColorPalette.count;
				let color = ColorPalette.asRGBA[colorIndex | 0];
				this.px.set(i, this.frameCount, color);
			}
		}

		this.px.flush();
		this.px._updateRenderInfos();
	}
}

export default Static;