import Manifest from "../../../src/assets/Manifest.js";
import { fail } from "../../../src/utils/Log.js";
import PIXI from "../../../src/core/PIXIWrapper.js";
import Spritesheets from "../../../src/assets/Spritesheets.js";
import Keyboard from "../../../src/input/Keyboard.js";
import Keys from "../../../src/input/Keys.js";
import Screen from "../../../src/game/Screen.js";
import Entity from "../../../src/game/Entity.js";
import BitmapText from "../../../src/game/BitmapText.js";

const MAX_X = Manifest.get("/w");
const MAX_Y = Manifest.get("/h");

// pico8 color palette (minus the bg color: #1D2B53)
const COLORS = [
	0x000000, 0x7E2553, 0x008751, 0xAB5236,
	0x5F574F, 0xC2C3C7, 0xFFF1E8, 0xFF004D,
	0xFFA300, 0xFFEC27, 0x00E436, 0x29ADFF,
	0x83769C, 0xFF77A8, 0xFFCCAA];

// let's start with white
let COLOR_INDEX = 6;

const helpMessage =
` [^] and [v]:
    Change color
 [<] and [>]:
    Move
 [S]:
    snow :)

 Press [S] to start!`;

class Sand extends Screen {
	constructor() {
		super();

		this.started = false;

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
		this.cursor.configSprite({
			sheet: "happy",
			animations: {
				default: "smile",
				smile: { frames: [0] },
				puke: { frames: [1] }
			}
		});
		this.cursor.x = MAX_X / 2 - 8;
		this.cursor.y = 2;
		this.add(this.cursor);

		// help text
		this.helpText = new BitmapText({
			font: "font1",
			color: COLORS[6],
			x: 3,
			y: MAX_Y / 2 - 16,
			leading: 2,
			text: helpMessage
		});
		this.add(this.helpText);
	}

	spawnParticle(x, y) {
		if (this.isFree(x, y)) {
			let p = this.getParticle(x, y);
			p.tint = COLORS[COLOR_INDEX];
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
		// start game
		if (!this.started) {
			if (Keyboard.pressed(Keys.S)) {
				this.started = true;
				this.helpText.visible = false;
			} else {
				return;
			}
		}

		// move cursor
		if (Keyboard.wasPressedOrIsDown(Keys.LEFT)) {
			this.cursor.x--;
		} else if (Keyboard.wasPressedOrIsDown(Keys.RIGHT)) {
			this.cursor.x++;
		}

		// change color
		if (Keyboard.pressed(Keys.UP)) {
			COLOR_INDEX++;
		} else if (Keyboard.pressed(Keys.DOWN)) {
			COLOR_INDEX--;
		}
		COLOR_INDEX = COLOR_INDEX < 0 ? COLORS.length - 1 : COLOR_INDEX % COLORS.length;

		// rain sand
		if (Keyboard.wasPressedOrIsDown(Keys.S)) {
			this.cursor.playAnimation({ name: "puke" });
			this.spawnParticle(this.cursor.x + 16, this.cursor.y + 10);
			this.spawnParticle(this.cursor.x + 16 - 5, this.cursor.y+11);
			this.spawnParticle(this.cursor.x + 16 + 5, this.cursor.y+11);
		} else {
			this.cursor.playAnimation({ name: "smile" });
		}

		this.activeParticles.forEach((p) => {

			// 1 particle below
			if (!this.isFree(p.x, p.y + 1)) {
				let dx = Math.random() > 0.5 ? 1 : -1;

				// check [1]: 1 down, 1 horizontal randomly
				if (this.isFree(p.x + dx, p.y + 1)) {
					p.x += dx;
					p.y += 1;
				} else if (this.isFree(p.x - dx, p.y + 1)){
					// check [2]: 1 down, 1 horizontal (other direction)
					p.x -= dx;
					p.y += 1;
				} else {
					this.fixPixel(p.x, p.y);
					this.releaseParticle(p);
				}
			} else {
				// free fall
				p.y += 1;

				// spread horizontally (20% chance)
				if (Math.random() < 0.2) {
					let dx = Math.random() > 0.5 ? 1 : -1;
					if (this.isFree(p.x + dx, p.y)) {
						p.x += dx;
					} else if (this.isFree(p.x - dx, p.y)) {
						p.x -= dx;
					}
				}
			}
		});
	}
}

export default Sand;