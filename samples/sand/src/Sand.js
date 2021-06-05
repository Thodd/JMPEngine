import PIXI from "../../../src/core/PIXIWrapper.js";
import { fail } from "../../../src/utils/Log.js";
import Spritesheets from "../../../src/assets/Spritesheets.js";
import Keyboard from "../../../src/input/Keyboard.js";
import Keys from "../../../src/input/Keys.js";
import Screen from "../../../src/game/Screen.js";
import Entity from "../../../src/game/Entity.js";

const MAX_X = 144;
const MAX_Y = 128;

class Sand extends Screen {
	constructor() {
		super();

		// Get spritesheet for the particle (1x1 pixel)
		let sheet = Spritesheets.getSheet("pixel");
		this.pixelTexture = sheet.textures[0];

		// rendering container
		// we use a simple PIXI.Container and not a PIXI.ParticleContainer,
		// since we want to set a particles visibility
		this.particleContainer = new PIXI.Container();
		this.particlePool = [];
		this.activeParticles = [];

		// render graphics for all fixed sand pixels
		this.fixedGraphics = new PIXI.Graphics();

		// jmp entity for the particle container
		this.containerEntity = new Entity();
		this.containerEntity.configSprite({
			replaceWith: this.particleContainer
		});
		this.add(this.containerEntity);

		// jmp entity for the fixed graphics
		this.fixedGraphicsEntity = new Entity();
		this.fixedGraphicsEntity.configSprite({
			replaceWith: this.fixedGraphics
		});
		this.add(this.fixedGraphicsEntity);

		// map of "fixed" for collision detection
		this.fixedPixels = [];
		for (let x = 0; x < MAX_X; x++) {
			this.fixedPixels[x] = [];
			for (let y = 0; y < MAX_Y; y++) {
				this.fixedPixels[x][y] = null;
			}
		}

		// cursor entity
		this.cursor = new Entity();
		this.cursor.x = MAX_X / 2;
		this.cursor.y = 10;
		this.add(this.cursor);
	}

	spawnParticle(x, y) {
		if (this.isFree(x, y)) {
			let p = this.getParticle(x, y);
			this.activeParticles.push(p);
		}
	}


	getParticle(x, y) {
		let p = this.particlePool.pop();
		if (!p) {
			p = new PIXI.Sprite();
			p.texture = this.pixelTexture;
			this.particleContainer.addChild(p);
		}
		p.x = x;
		p.y = y;
		p.visible = true;
		return p;
	}

	releaseParticle(p) {
		// this.particlePool.push(p);
		let i = this.activeParticles.indexOf(p);
		if (i >= 0) {
			this.activeParticles.splice(i, 1);
		} else {
			fail("Cannot release inactive particle!");
		}
		// p.visible = false;
	}

	isFree(x, y) {
		return x < MAX_X && x >= 0 && y < MAX_Y && y >= 0 && !this.fixedPixels[x][y];
	}

	fixPixel(x, y) {
		if (x >= 0 && x < MAX_X && y >= 0 && y < MAX_Y) {
			this.fixedPixels[x][y] = 1;
		}
	}

	update() {
		// move cursor
		if (Keyboard.wasPressedOrIsDown(Keys.LEFT)) {
			this.cursor.x--;
		} else if (Keyboard.wasPressedOrIsDown(Keys.RIGHT)) {
			this.cursor.x++;
		}

		// change color
		if (Keyboard.wasPressedOrIsDown(Keys.UP)) {

		} else if (Keyboard.wasPressedOrIsDown(Keys.DOWN)) {

		}

		// rain sand
		if (Keyboard.wasPressedOrIsDown(Keys.ENTER)) {
			this.spawnParticle(this.cursor.x, this.cursor.y);
			this.spawnParticle(this.cursor.x-5, this.cursor.y+1);
			this.spawnParticle(this.cursor.x+5, this.cursor.y+1);
		}

		this.activeParticles.forEach((p) => {
			// spread horizontally
			let dx = Math.random() > 0.5 ? 1 : -1;
			// gravity
			let dy = 1;

			let nx = p.x + dx;
			let ny = p.y + dy;

			// check 1: one down & one horizontal
			if (this.isFree(nx, ny)) {
				p.x = nx;
				p.y = ny;
				return;
			} else {
				// check 2: one down & one horizontal (other direction)
				nx = p.x - dx;
				if (this.isFree(nx, ny)) {
					p.x = nx;
					p.y = ny;
					return;
				} else {
					// check 3: just one down, no horizontal
					if (this.isFree(p.x, ny)) {
						p.y = ny;
						return;
					} else {
						// no possible movement, fix pixel
						this.fixPixel(p.x, p.y);
						this.releaseParticle(p);
					}
				}
			}
		});
	}
}

export default Sand;