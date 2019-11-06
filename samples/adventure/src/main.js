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

Engine.screen.clearLayer(0, "#333333");
Engine.screen.clearLayer(1, "transparent");
Engine.screen.clearLayer(2, "transparent");
Engine.screen.clearLayer(3, "transparent");

/**
 * Simple Entity with input handling
 */
var e = new Entity();

e.setSprite({
	sheet: "player",
	color: "#FF8500",

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
			frames: [20, 21, 20, 22],
			delay: 7
		},
		"idle_up": {
			frames: [20]
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

e.inputDelay = new FrameCounter(3);

e.added = function() {
	log("added");
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
		yDif = -1;
		this._lastDir = "up";
	} else if (Keyboard.down(Keys.DOWN)) {
		yDif = +1;
		this._lastDir = "down";
	}

	if (yDif != 0 || xDif != 0) {
		this.x += xDif;
		this.y += yDif;
		this.playAnimation({name: `walk_${this._lastDir}`});
	} else {
		this.playAnimation({name: `idle_${this._lastDir}`});
	}

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


let text = new Entity();
text.render = () => {
	GFX.text("font0", 1, 111, "JMP Adventure", 3, "#000000");
	GFX.text("font0", 0, 110, "JMP Adventure", 3, "#FFFFFF");
};
Engine.screen.add(text);