import Manifest from "../../src/Manifest.js";
import GFX from "../../src/gfx/GFX.js";
import Screen from "../../src/game/Screen.js";

import Feather from "./renderers/Feather.js";
import Spiral from "./renderers/Spiral.js";
import Plasma0 from "./renderers/Plasma0.js";

class DemoScreen extends Screen {
	constructor() {
		super();

		this.demo = Plasma0;
	}

	render() {
		this.demo.renderer();

		// render author name
		let g = GFX.get(1);
		g.rectf(0, 0, Manifest.get("/w"), 10, GFX.pal(0));
		g.text("font0", 1, 1, this.demo.author, GFX.pal(8), true);
	}
}

export default DemoScreen;