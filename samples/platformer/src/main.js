import Engine from "../../../src/Engine.js";
import Screen from "../../../src/game/Screen.js";
import Entity from "../../../src/game/Entity.js";
import { log } from "../../../src/utils/Log.js";
import Keyboard from "../../../src/input/Keyboard.js";
import Keys from "../../../src/input/Keys.js";
import FrameCounter from "../../../src/utils/FrameCounter.js";
import Tilemap from "../../../src/game/Tilemap.js";
import GFX from "../../../src/gfx/GFX.js";
import RNG from "../../../src/utils/RNG.js";

Engine.screen = new Screen();
Engine.screen.layers(0).fixedCam = true;
Engine.screen.layers(3).fixedCam = true;

Entity.RENDER_HITBOXES = "#FF0085";

/**
 * Simple Entity with input handling
 */
var e = new Entity();
e.setTypes(["player"]);
e.x = 70;
e.y = 78;
e.layer = 2;

e.hitbox.y = 2;
e.hitbox.w = 8;
e.hitbox.h = 8;

window.player = e;

e.inputDelay = new FrameCounter(3);

let defaultDelay = 5;

e.setSprite({
	sheet: "player",

	animations: {
		default: "idle_right",

		"walk_right": {
			frames: [2, 3],
			delay: defaultDelay
		},
		"idle_right": {
			frames: [2]
		},

		"walk_left": {
			frames: [12, 13],
			delay: defaultDelay
		},
		"idle_left": {
			frames: [12]
		},

		"idle_rightup": {
			frames: [4]
		},
		"walk_rightup": {
			frames: [4, 5],
			delay: defaultDelay
		},

		"idle_leftup": {
			frames: [14]
		},
		"walk_leftup": {
			frames: [14, 15],
			delay: defaultDelay
		}
	}
});

e._dirs = {
	horizontal: "right",
	vertical: ""
};

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

	if (Keyboard.down(Keys.LEFT)) {
		xDif = -1;
		this._dirs.horizontal = "left";
	} else if (Keyboard.down(Keys.RIGHT)) {
		xDif = +1;
		this._dirs.horizontal = "right";
	}

	if (Keyboard.down(Keys.UP)) {
		this._dirs.vertical = "up";
	} else if (Keyboard.down(Keys.DOWN)) {
		// nothing
		// this._dirs.vertical = "down";
	} else {
		// not looking up or down
		this._dirs.vertical = "";
	}

	let animType = "idle";
	if (xDif != 0) {
		this.x += xDif;
		animType = "walk"
	}

	this.playAnimation({name: `${animType}_${this._dirs.horizontal}${this._dirs.vertical}`});

	Engine.screen.cam.x = this.x - 70;
	Engine.screen.cam.y = this.y - 78;

	if (Keyboard.pressed(Keys.SPACE)) Engine.screen.remove(this);
};

Engine.screen.add(e);


for (let i = 0; i < 10; i++) {
	let e = new Entity();
	e.hitbox.w = 8;
	e.hitbox.h = 8;
	e.setTypes(["box"]);
	e.layer = 4;
	e.x = RNG.randomInteger(0, 120);
	e.y = RNG.randomInteger(0, 88);
	e.setSprite({
		sheet:"tileset",
		id: 9
	});
	Engine.screen.add(e);
}


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
	GFX.text("font0", 2, 2, "Platformer Demo", 3, "#000000");
	GFX.text("font0", 1, 1, "Platformer Demo", 3, "#FFFFFF");
};
Engine.screen.add(text);