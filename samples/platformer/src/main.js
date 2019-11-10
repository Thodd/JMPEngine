import Engine from "../../../src/Engine.js";
import Screen from "../../../src/game/Screen.js";
import Entity from "../../../src/game/Entity.js";
import { log } from "../../../src/utils/Log.js";
import Keyboard from "../../../src/input/Keyboard.js";
import Keys from "../../../src/input/Keys.js";
import FrameCounter from "../../../src/utils/FrameCounter.js";
import Tilemap from "../../../src/game/Tilemap.js";
import GFX from "../../../src/gfx/GFX.js";

Engine.screen = new Screen();
Engine.screen.layers(0).fixedCam = true;
Engine.screen.layers(3).fixedCam = true;

/**
 * Simple Entity with input handling
 */
var e = new Entity();

e.x = 70;
e.y = 78;
e.layer = 2;

e.inputDelay = new FrameCounter(3);

e.setSprite({
	sheet: "player",

	animations: {
		default: "walk_right",

		"walk_right": {
			frames: [0, 1],
			delay: 5
		},
		"idle_right": {
			frames: [0]
		},

		"walk_left": {
			frames: [10, 11],
			delay: 5
		},
		"idle_left": {
			frames: [10]
		}
	}
});

e.added = function() {
	log("Entity was added to the Screen!");
};

e.removed = function() {
	log("removed");
	Engine.screen.add(e);
};

e.update = function() {
	// delay the input a bit
	if (this.inputDelay.isReady()) {
		return;
	}

	let xDif = 0;
	let yDif = 0;

	if (Keyboard.down(Keys.LEFT)) {
		xDif = -1;
		this._lastDir = "left";
	} else if (Keyboard.down(Keys.RIGHT)) {
		xDif = +1;
		this._lastDir = "right";
	}

	if (Keyboard.down(Keys.UP)) {

	} else if (Keyboard.down(Keys.DOWN)) {

	}

	if (xDif != 0) {
		this.x += xDif;
		this.playAnimation({name: `walk_${this._lastDir}`});
	} else {
		this.playAnimation({name: `idle_${this._lastDir}`});
	}

	Engine.screen.cam.x = this.x - 70;
	Engine.screen.cam.y = this.y - 78;

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

for (let x = 0; x < 16; x++) {
	t.set(x, 11, 11);
}


Engine.screen.add(t);


let bg = new Entity();
bg.layer = 0;
bg.setSprite({
	sheet: "background"
});
Engine.screen.add(bg);


let text = new Entity();
text.render = () => {
	GFX.text("font0", 1, 1, "Platformer Demo", 3, "#FFFFFF");
	GFX.text("font0", 0, 0, "Platformer Demo", 3, "#000000");
};
Engine.screen.add(text);