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
	GFX.clear(0, "#222222");
	p=t()/2;
	for (let i=0; i<160; i++) {
		for (let j=0; j<144; j++) {
			x=i/64;
			y=j/64;
			s=Math.sin(x*Math.cos(y+p*3)+y*Math.sin(x+p*3));
			if(s>-1){GFX.px(i,j,GFX.pal[Math.floor(8+2.5*s)]);}
		}
	}
}

export default {
	renderer,
	author
};