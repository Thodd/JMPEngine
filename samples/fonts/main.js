import Engine from "../../../src/Engine.js";
import Screen from "../../../src/game/Screen.js";
import Entity from "../../../src/game/Entity.js";
import GFX from "../../../src/gfx/GFX.js";
import FrameCounter from "../../../src/utils/FrameCounter.js";


/**
 * Low-Level Text Rendering Demo
 */
Engine.screen = new Screen();

var z = new Entity();
z.iCol = 0;
z.iCount = 0;
z.iStep = 0.1;
z.msg = ".JMP Rendering Engine.";

var fc = new FrameCounter(3);

z.render = function() {
	// clear layer 0 for a dark background color
	GFX.clear(0, "#111111");

	for (var i = 0; i < this.msg.length; i++) {
		var sChar = this.msg[i];
		GFX.text("font0", 3 + (i * 7), 30 + Math.cos(i/3 + this.iCount) * Math.max(0, 30 - this.iCount), sChar, 0, GFX.pal[(this.iCol + i) % 15]);
	}
	this.iCount += this.iStep;

	if (fc.isReady()) {
		this.iCol++;
	}
};
Engine.screen.add(z);