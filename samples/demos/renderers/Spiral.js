import Engine from "../../../src/Engine.js";
import GFX from "../../../src/gfx/GFX.js";
import Helper from "../../../src/utils/Helper.js";

const author = "@SeanSLeBlanc";

const setup = function() {
	GFX.getBuffer(0).setClearColor("#222222");
}

const renderer = function () {
	/**
	 * Demo made by Sean S. LeBlanc (@SeanSLeBlanc)
	 * Changed the colors.
	 *
	 * Ported from this #tweetcart:
	 * https://twitter.com/SeanSLeBlanc/status/781767880509497344
	 */
	let A = GFX.w/2;
	let B = GFX.h/2;
	let X = GFX.w/2;
	let Y = GFX.h/2;
	let T = Engine.now() / 2;

	let g = GFX.get(0);

	for (let I = Math.sin(T); I < 99; I += Math.cos(T)+1.1) {
		X+=I*Math.sin(I);
		Y+=I*Math.cos(I);
		g.line(A,B,X,Y,Helper.choose(GFX.pal(), 4, 16));
		A = X;
		B = Y;
	}
};

export default {
	setup,
	renderer,
	author
}