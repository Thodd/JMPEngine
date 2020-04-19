import Engine from "../../../src/Engine.js";
import GFX from "../../../src/gfx/GFX.js";
import ArrayHelper from "../../../src/utils/ArrayHelper.js";

export default function() {
	/**
	 * Demo made by Sean S. LeBlanc
	 * Changed the colors.
	 *
	 * Ported from this #tweetcart:
	 * https://twitter.com/SeanSLeBlanc/status/781767880509497344
	 */
	GFX.clear(0, "#222222");
	var A = GFX.w/2;
	var B = GFX.h/2;
	var X = GFX.w/2;
	var Y = GFX.h/2;
	var T = Engine.now() / 2;

	for (var I = Math.sin(T); I < 99; I += Math.cos(T)+1.1) {
		X+=I*Math.sin(I);
		Y+=I*Math.cos(I);
		GFX.line(A,B,X,Y,ArrayHelper.choose(GFX.pal, 4, 16));
		A = X;
		B = Y;
	}

	GFX.rectf(0, 0, 128, 10, GFX.pal[0], 1);
	GFX.text("font0", 1, 1, "@SeanSLeBlanc", 1, "#ffffff");
}