import Engine from "../src/Engine.js";
import Screen from "../src/game/Screen.js";
import GFX from "../src/gfx/GFX.js";

Engine.start({
	placeAt: "content"
}).then(() => {
	Engine.world = new Screen();

	function circpulse(x,y,r){
		GFX.circ(x-1, y, r, "#FF0085");
		GFX.circ(x,   y, r, "#FF8500");
		GFX.circ(x+1, y, r, "#0085FF");
	}

	Engine.world.render = () => {

		var w = 10;

		GFX.clear(0, "#EEFFDD");
		var a = w * Math.sin(Engine.now()/1.5);
		for (var i = 0; i < 15; i++) {
			for (var j= 0; j < 15; j++) {
				circpulse(16*i, 16*j, w + Math.pow(-1,i+j)*a);
			}
		}
	};
})