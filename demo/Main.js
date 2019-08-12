import Engine from "../src/Engine.js";
import Screen from "../src/game/Screen.js";
import Entity from "../src/game/Entity.js";
import { log } from "../src/utils/Log.js";
import GFX from "../src/gfx/GFX.js";
import Keyboard from "../src/input/Keyboard.js";
import Keys from "../src/input/Keys.js";
import FrameCounter from "../src/utils/FrameCounter.js";

Engine.start({
	placeAt: "content",
	manifest: "./manifest.json"
}).then(() => {
	Engine.screen = new Screen();

	Engine.screen.clearLayers = [0, 1, 2];

	var e = new Entity();
	e.sprite = {
		sheet: "tileset",
		id: 0,
		offsetX: 0,
		offsetY: 0
	};
	e.layer = 1;

	e.added = function() {
		log("added");
	};

	e.removed = function() {
		log("removed");
		Engine.screen.add(e);
	};

	e.update = function() {
		if (Keyboard.down(Keys.LEFT)) this.x--;
		if (Keyboard.down(Keys.RIGHT)) this.x++;
		if (Keyboard.down(Keys.UP)) this.y--;
		if (Keyboard.down(Keys.DOWN)) this.y++;
		if (Keyboard.pressed(Keys.SPACE)) Engine.screen.remove(this);
	};

	/*map.create({
		id: "overworld",
		sheet: "tileset",
		w: 50,
		h: 50
	});

	map.set("overworld", 1, 1, 35);*/

	var z = new Entity();
	z.iCol = 0;
	z.iCount = 0;
	z.iStep = 0.1;
	z.msg = " . JMP Rendering Engine . ";
	var fc = new FrameCounter(3);
	z.render = function() {
		//GFX.map("overworld", 0, 0, 0);

		GFX.clear(2);
		for (var i = 0; i < this.msg.length; i++) {
			var sChar = this.msg[i];
			GFX.text("font0", i * 7, 100 + Math.cos(i/3 + this.iCount) * Math.max(0, 30 - this.iCount), sChar, 2, GFX.pal[(this.iCol + i) % 15]);
		}
		this.iCount += this.iStep;

		if (fc.isReady()) {
			this.iCol++;
		}

	};
	Engine.screen.add(z);

	Engine.screen.add(e);
});