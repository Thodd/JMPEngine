import Engine from "../../../src/Engine.js";
import GFX from "../../../src/gfx/GFX.js";
import { random } from "../../../src/utils/RNG.js";

const author = "@blokatt";

let x=0, y=20, w=.17;

const renderer = function() {
	// made by Jan Vorisek
	// @blokatt
	GFX.setRenderMode(0, GFX.RenderModes.RAW);
	let g = GFX.get(0);
	g.clear("#222222");
	for (let i=0; i<2800; i++) {
		let j = x, k = y, r = random();
		if (r<.02) {
			x=0;
			y=w*k;
		} else if (r<.86) {
			x=.85*j+k*.04;
			y=-.04*j+.85*k+1.6;
		} else if (r<.93) {
			x=w*j-k*.26;
			y=w*j+w*k+1.6;
		} else {
			x=-.15*j+k*.28;
			y=.26*j+w*k+.4;
		}
		g.pxSet(x*Math.sin(Engine.now()*10*w)*15+80, 135-y*12, GFX.pal(Math.floor(4+y+r)));
	}
}

export default {
	renderer,
	author
}