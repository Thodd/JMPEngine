import Screen from "../../../src/game/Screen.js";
import Entity from "../../../src/game/Entity.js";
import Keyboard from "../../../src/input/Keyboard.js";
import Keys from "../../../src/input/Keys.js";
import PIXI from "../../../src/utils/PIXIWrapper.js";
import Spritesheets from "../../../src/assets/Spritesheets.js";
import { log } from "../../../src/utils/Log.js";

class WorldScreen extends Screen {
	constructor() {
		super();

		let e = new Entity();
		e.configVisuals({
			sheet: "player",
			id: 0,
			offset: {
				x: 16,
				y: 16
			}
		});

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

			s.cam.x = this.x - s.getWidth()/2;
			s.cam.y = this.y - s.getHeight()/2;
		}

		// canvas test
		let c = document.createElement("canvas");
		c.width = 16;
		c.height = 16;
		let ctx = c.getContext("2d");
		let sheet = Spritesheets.getSheet("tileset");

		ctx.drawImage(sheet.orgTexture.baseTexture.resource.source, 16, 0, 16, 16, 0, 0, 16, 16);
		document.body.appendChild(c); // debug

		let test = new Entity();
		test.configVisuals({
			texture: PIXI.Texture.from(c)
		});
		test.x = 20;
		test.y = 20;

		this.add(test);

		// primitives
		let gfxEntity = new Entity();
		let g = new PIXI.Graphics();
		g.x = 0;
		g.y = 0;
		g.lineStyle(1, 0xFF0085, 1);
		g.drawRect(1, 0, this.getWidth()-1, this.getHeight()-1);

		gfxEntity.configVisuals({
			replaceWith: g
		});

		this.add(gfxEntity);

		// stress test
		let w = this.getWidth();
		let h = this.getHeight();

		for (let i = 0; i < 10; i++) {
			let e = new Entity();
			e.configVisuals({
				sheet: "player",
				id: 0,
				offset: {x:16, y:16}
			});
			e.x = Math.floor(Math.random() * w);
			e.y = Math.floor(Math.random() * h);
			e.xdir = Math.random() > 0.5 ? -1 : 1;
			e.ydir = Math.random() > 0.5 ? -1 : 1;

			this.add(e);

			//e._pixiSprite.anchor.set(0.5);
			//e.height *= 2;
			//e.width *= 2;

			e.update = function () {
				if (this.x >= w-16 || this.x <= 0) {
					this.xdir *= -1;
				}
				if (this.y >= h-16 || this.y <= 0) {
					this.ydir *= -1;
				}

				this.x += this.xdir;
				this.y += this.ydir;
				//this.rotation += 0.1;
			};
		}
	}
}

export default WorldScreen;