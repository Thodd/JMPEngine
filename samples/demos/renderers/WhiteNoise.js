import GFX from "../../../src/gfx/GFX.js";
import Buffer from "../../../src/gfx/Buffer.js";
import Helper from "../../../src/utils/Helper.js";

const palette = GFX.pal();

const author = "@th0dd";

const setup = function() {
	let b = GFX.getBuffer(0);
	b.setRenderMode(Buffer.RenderModes.RAW);
	b.setClearColor("#000000");
}

const renderer = function() {
	let g = GFX.get(0);
	for (let x=0; x<160; x++) {
		for (let y=0; y<144; y++) {
			g.pxSet(x, y, Helper.choose(palette));
		}
	}
}

export default {
	setup,
	renderer,
	author
}