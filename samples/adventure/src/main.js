import Engine from "../../../src/Engine.js";
import Screen from "../../../src/game/Screen.js";
import Entity from "../../../src/game/Entity.js";
import { log } from "../../../src/utils/Log.js";
import GFX from "../../../src/gfx/GFX.js";
import Keyboard from "../../../src/input/Keyboard.js";
import Keys from "../../../src/input/Keys.js";
import FrameCounter from "../../../src/utils/FrameCounter.js";
import Tilemap from "../../../src/game/Tilemap.js";

Engine.screen = new Screen();

Engine.screen.clearLayers = [0, 1, 2];

/**
 * Simple Entity with input handling
 */
var e = new Entity();

e.setSprite({
	sheet: "player",
	color: "#FF0000",

	animations: {
		default: "walk_down",

		"walk_down": {
			frames: [0, 1, 0, 2],
			delay: 7
		},
		"idle_down": {
			frames: [0]
		},

		// TODO:
		"walk_up": {
			frames: [13, 14, 13, 15],
			delay: 7
		},
		"idle_up": {
			frames: [0]
		},

		"walk_left": {
			frames: [13, 14, 13, 15],
			delay: 7
		},
		"idle_left": {
			frames: [13]
		},

		"walk_right": {
			frames: [10, 11, 10, 12],
			delay: 7
		},
		"idle_right": {
			frames: [10]
		},
	}
});
e.layer = 2;

e.added = function() {
	log("added");
};

e.removed = function() {
	log("removed");
	Engine.screen.add(e);
};

e.update = function() {
	if (Keyboard.down(Keys.LEFT)) this.x-=1;
	if (Keyboard.down(Keys.RIGHT)) this.x+=1;
	if (Keyboard.down(Keys.UP)) this.y-=1;
	if (Keyboard.down(Keys.DOWN)) this.y+=1;
	if (Keyboard.pressed(Keys.SPACE)) Engine.screen.remove(this);
};

Engine.screen.add(e);

/**
 * Tilemap demo
 */
let t = new Tilemap({
	sheet: "tileset",
	w: 50,
	h: 50
});
t.x = 0;
t.y = 0;
t.layer = 1;

t.set(1, 1, 32, "#FF0022");
t.get(6, 7).set(35, "#0000FF");
t.set(6, 4, 33);

Engine.screen.add(t);

/**
 * Low-Level Text Rendering Demo
 */

// clear layer 0 for a dark background color
GFX.clear(0, "#222222");

var z = new Entity();
z.iCol = 0;
z.iCount = 0;
z.iStep = 0.1;
z.msg = ".JMP Rendering Engine.";
var fc = new FrameCounter(3);
z.render = function() {
	for (var i = 0; i < this.msg.length; i++) {
		var sChar = this.msg[i];
		GFX.text("font0", 3 + (i * 7), 80 + Math.cos(i/3 + this.iCount) * Math.max(0, 30 - this.iCount), sChar, 2, GFX.pal[(this.iCol + i) % 15]);
	}
	this.iCount += this.iStep;

	if (fc.isReady()) {
		this.iCol++;
	}
};
Engine.screen.add(z);