import Engine from "../../src/Engine.js";
import Screen from "../../src/game/Screen.js";
import GFX from "../../src/gfx/GFX.js";
import ArrayHelper from "../../src/utils/ArrayHelper.js";
import { random } from "../../src/utils/RNG.js";

Engine.screen = new Screen();

let x=0, y=0, w=.17;

Engine.screen.render = () => {
	/**
	 * Demo made by Sean S. LeBlanc#
	 * Changed the colors.
	 *
	 * Ported from this #tweetcart:
	 * https://twitter.com/SeanSLeBlanc/status/781767880509497344
	 */
	GFX.clear(0, "#333333");
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

	// Jan Vorisek
	// @blokatt
	//GFX.clear(0, "#333333");
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
		GFX.px(x*Math.sin(Engine.now()*10*w)*15+64, 127-y*12, GFX.pal[Math.floor(4+y+r)]);
	}

};