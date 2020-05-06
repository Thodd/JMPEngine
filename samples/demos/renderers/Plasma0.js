import Engine from "../../../src/Engine.js";
import GFX from "../../../src/gfx/GFX.js";

let author = "@picoter8";

/**
 * Made by @picoter8
 * https://twitter.com/picoter8/status/1229649268132241408
 * But... I did some modifications to fit the JMP GFX api better.
 */
let p,x,y,s, t = Engine.now;
const renderer = function() {
	let g = GFX.get(0);
	g.clear("#FF0085");
	p=t()/2;
	for (let i=0; i<160; i++) {
		for (let j=0; j<144; j++) {
			x=i/32;
			y=j/32;
			s=Math.sin(x*Math.cos(y+p*3)+y*Math.sin(x+p*3));
			if(s>-1){g.px(i,j,GFX.pal(Math.floor(8+2.5*s)));}
		}
	}

	g.pxFlush();
}

export default {
	renderer,
	author
};