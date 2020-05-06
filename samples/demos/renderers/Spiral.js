import Engine from "../../../src/Engine.js";
import GFX from "../../../src/gfx/GFX.js";
import Helper from "../../../src/utils/Helper.js";

const author = "@SeanSLeBlanc";

const renderer = function () {
	/**
	 * Demo made by Sean S. LeBlanc (@SeanSLeBlanc)
	 * Changed the colors.
	 *
	 * Ported from this #tweetcart:
	 * https://twitter.com/SeanSLeBlanc/status/781767880509497344
	 */
	GFX.get(0).clear("#222222");
	let A = GFX.w/2;
	let B = GFX.h/2;
	let X = GFX.w/2;
	let Y = GFX.h/2;
	let T = Engine.now() / 2;

	for (let I = Math.sin(T); I < 99; I += Math.cos(T)+1.1) {
		X+=I*Math.sin(I);
		Y+=I*Math.cos(I);
		GFX.get(0).line(A,B,X,Y,Helper.choose(GFX.pal(), 4, 16));
		A = X;
		B = Y;
	}
};

export default {
	renderer,
	author
}