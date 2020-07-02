import Screen from "../../../src/game/Screen.js";
import Entity from "../../../src/game/Entity.js";
import Keyboard from "../../../src/input/Keyboard.js";
import Keys from "../../../src/input/Keys.js";
import Spritesheets from "../../../src/assets/Spritesheets.js";
import { log } from "../../../src/utils/Log.js";
import Helper from "../../../src/utils/Helper.js";

import PIXI from "../../../src/core/PIXIWrapper.js";

import Tilemap from "../../../src/game/Tilemap.js";
import Tile from "../../../src/game/Tile.js";

class WorldScreen extends Screen {
	constructor() {
		super();

		// tilemap
		let t = new Tilemap({
			sheet: "tileset",
			w: 20,
			h: 20,
			// adhoc tile class with random ID  ->  JavaScript is actually pretty awesome :)
			tileClass: class Tile2 extends Tile {
				constructor(cfg) {
					super(cfg);
					this.id = Helper.choose([0, 0, 0, 0, 0, 0, 1, 3, 5, 6, 7]);
				}
			}
		});
		this.add(t);



		// entity with input handling e.g. player
		let e = new Entity();
		e.configVisuals({
			sheet: "player",
			id: 0,
			offset: {
				x: -16,
				y: -16
			}
		});
		e.isPlayer = true; // debug
		e.layer = 4;

		this.add(e);

		e.update = function () {
			let s = this.getScreen();

			if (Keyboard.pressed(Keys.SPACE)) {
				log(`x: ${s.cam.x}, y: ${s.cam.y}`);
			}

			if (Keyboard.down(Keys.DOWN)) {
				this.y++;
			} else if (Keyboard.down(Keys.UP)) {
				this.y--;
			}
			if (Keyboard.down(Keys.RIGHT)) {
				this.x++;
			} else if (Keyboard.down(Keys.LEFT)) {
				this.x--;
			}

			s.centerCameraAround(this);
		}

		// initial camera position
		this.centerCameraAround(e);



		// render something to a canvas and add it as a texture again
		let c = document.createElement("canvas");
		c.width = 16;
		c.height = 16;
		let ctx = c.getContext("2d");
		let sheet = Spritesheets.getSheet("tileset");

		ctx.drawImage(sheet.orgTexture.baseTexture.resource.source, 64, 32, 16, 16, 0, 0, 16, 16);
		document.body.appendChild(c); // debug

		let test = new Entity();
		test.layer = 3;
		test.isCanvasTest = true; // debug
		test.configVisuals({
			texture: PIXI.Texture.from(c)
		});
		test.autoVisibility = true;
		test.x = 20;
		test.y = 20;

		this.add(test);



		// Entity with no visuals
		let noVisuals = new Entity();
		noVisuals.isNoVisuals = true; // debug
		this.add(noVisuals);



		// primitives on PIXI.Graphics
		let gfxEntity = new Entity();
		gfxEntity.isGraphics = true; // debug
		let g = new PIXI.Graphics();
		g.x = 0;
		g.y = 0;
		g.lineStyle(1, 0xFF0085, 1);
		g.drawRect(1, 0, this.getWidth()-1, this.getHeight()-1);

		gfxEntity.configVisuals({
			replaceWith: g
		});

		this.add(gfxEntity);



		// Random entity with game logic
		// change the # to build a stress test... kindof like a "bunnymark" :)
		let w = this.getWidth();
		let h = this.getHeight();

		for (let i = 0; i < 10; i++) {
			let e = new Entity();
			e.configVisuals({
				sheet: "player",
				id: 0,
				offset: {x:8, y:8}
			});
			//e.autoVisibility = true;
			e.isDude = true; // debug
			e.x = Math.max(Math.floor(Math.random() * w) - 16, 16);
			e.y = Math.max(Math.floor(Math.random() * h) - 16, 16);
			e.xdir = Math.random() > 0.5 ? -1 : 1;
			e.ydir = Math.random() > 0.5 ? -1 : 1;

			this.add(e);

			e._pixiSprite.anchor.set(0.5);
			// e._pixiSprite.height *= 2;
			// e._pixiSprite.width *= 2;

			e.update = function () {
				if (this.x >= w-16 || this.x <= 0) {
					this.xdir *= -1;
				}
				if (this.y >= h-16 || this.y <= 0) {
					this.ydir *= -1;
				}

				this.x += this.xdir;
				this.y += this.ydir;
				this._pixiSprite.rotation += 0.1;
			};
		}
	}

	/**
	 * Convenience function to center the camera around the given entity
	 * @param {*} e
	 */
	centerCameraAround(e) {
		this.cam.x = e.x - this.width/2;
		this.cam.y = e.y - this.height/2;
	}
}

export default WorldScreen;