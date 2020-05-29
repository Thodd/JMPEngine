import Screen from "../../../src/game/Screen.js";
import Entity from "../../../src/game/Entity.js";
import { log } from "../../../src/utils/Log.js";
import Keyboard from "../../../src/input/Keyboard.js";
import Keys from "../../../src/input/Keys.js";
import FrameCounter from "../../../src/utils/FrameCounter.js";
import Tilemap from "../../../src/game/Tilemap.js";
import Text from "../../../src/gfx/Text.js";
import GFX from "../../../src/gfx/GFX.js";

class WorldScreen extends Screen {
	constructor() {
		super();

		let that = this;

		/**
		 * Simple Entity with input handling
		 */
		let e = new Entity({x: 70, y: 70});
		e.layer = 2;

		e.inputDelay = new FrameCounter(5);

		e.setSprite({
			sheet: "characters",
			animations: {
				default: "walk_down",

				"down": {
					frames: [16, 17],
					delay: 30
				},

				"up": {
					frames: [18, 19],
					delay: 30
				},

				"left": {
					frames: [0, 1],
					delay: 30
				},

				"right": {
					frames: [2, 3],
					delay: 30
				}
			}
		});

		e.added = function() {
			log("Entity was added to the Screen!");
		};

		e.removed = function() {
			log("removed");
			that.add(e);
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

			if (xDif != 0 || yDif != 0) {
				this.x += xDif * 10;
				this.y += yDif * 10;
			}
			this.playAnimation({name: `${this._lastDir}`});

			that.cam.x = this.x - 70;
			that.cam.y = this.y - 70;

			if (Keyboard.pressed(Keys.SPACE)) that.remove(this);
		};

		this.add(e);

		/**
		 * Tilemap demo
		 */
		let t = new Tilemap({sheet: "tileset", x: 16, y: 12, version: Tilemap.Version.A});
		t.x = 0;
		t.y = 0;
		t.layer = 1;

		for (let x = 0; x < 16; x++) {
			t.set(x, 0, 32);
			t.set(x, 11, 32);
		}

		for (let y = 0; y < 12; y++) {
			t.set(0, y, 32);
			t.set(15, y, 32);
		}

		t.set(1, 1, 32);
		t.get(6, 7).set(35);
		t.set(6, 4, 33);

		this.add(t);

		// text sample
		let textShadow = new Text({text: "JMP Adventure", x: 1, y: 111, color: "#000000", useKerning: true});
		textShadow.layer = 3;
		this.add(textShadow);

		let textColored = new Text({text: "JMP Adventure", x: 0, y: 110, color: "#FFFFFF", useKerning: true});
		textColored.layer = 3;
		this.add(textColored);
	}

	setup() {
		GFX.getBuffer(0).setClearColor("#333333");
		GFX.getBuffer(3).setCameraFixed(true);
	}
}

export default WorldScreen;