import Manifest from "../../../../src/assets/Manifest.js";
import { fail } from "../../../../src/utils/Log.js";
import PIXI from "../../../../src/core/PIXIWrapper.js";
import Spritesheets from "../../../../src/assets/Spritesheets.js";
import Keyboard from "../../../../src/input/Keyboard.js";
import Keys from "../../../../src/input/Keys.js";
import Entity from "../../../../src/game/Entity.js";
import BitmapText from "../../../../src/game/BitmapText.js";
import RNG from "../../../../src/utils/RNG.js";
import ParticleEmitter from "../../../../src/game/ParticleEmitter.js";
import DemoScreen from "../DemoScreen.js";

const MAX_X = Manifest.get("/w");
const MAX_Y = Manifest.get("/h");

const OBSTACLES_COUNT = 15;

// pico8 color palette (minus the colors that don't look well as sand)
const COLORS = [
	/*0x000000, 0x1D2B53,*/ 0x7E2553, 0x008751,
	0xAB5236, 0x5F574F, 0xC2C3C7, 0xFFF1E8,
	0xFF004D, 0xFFA300, 0xFFEC27, 0x00E436,
	0x29ADFF, /*0x83769c,*/ 0xFF77A8, 0xFFCCAA];

const COLOR_TEXT = 0xFFF1E8;
const COLOR_OBSTACLES = 0x83769c;

// start color
let COLOR_INDEX = 8;

const helpMessage =
`<c=0x00e436>[^]</c> / <c=0x00e436>[v]</c>: Change color
<c=0x00e436>[<]</c> / <c=0x00e436>[>]</c>: Move cloud
<c=0x00e436>[S]</c>      : make it rain`;

const startMessage = `Press <c=0xff004d>[S]</c> to start!`;

class Sand extends DemoScreen {
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

		// map of "fixed" for collision detection
		this.fixedPixels = [];
		for (let x = 0; x < MAX_X; x++) {
			this.fixedPixels[x] = [];
			for (let y = 0; y < MAX_Y; y++) {
				this.fixedPixels[x][y] = null;
			}
		}

		this.setupCursor();

		this.setupIntroTexts();

		// particle poop
		this.particlePooper = new ParticleEmitter({
			colors: [0xFF004D, 0xFFA300, 0xFFEC27, 0x00E436, 0x29ADFF],
			maxRadius: 2,
			maxAge: 10,
			maxSpeed: 1,
			delay: 2
		});
		this.particlePooper.layer = 0;
		this.add(this.particlePooper);

		this._introPoopInterval = this.registerFrameEventInterval(() => {
			// top
			this.particlePooper.emit({
				x: 0,
				y: 0,
				angle: 135,
				delay: 1,
				amount: 20,
				minSpeed: 1,
				maxSpeed: 2,
				maxAge: 20,
				deviation: 1
			});
			this.particlePooper.emit({
				x: MAX_X,
				y: 0,
				angle: 225,
				delay: 1,
				amount: 20,
				minSpeed: 1,
				maxSpeed: 2,
				maxAge: 20,
				deviation: 1
			});

			// bottom
			this.particlePooper.emit({
				x: 0,
				y: MAX_Y,
				angle: 45,
				delay: 1,
				amount: 20,
				minSpeed: 1,
				maxSpeed: 2,
				maxAge: 20,
				deviation: 1
			});
			this.particlePooper.emit({
				x: MAX_X,
				y: MAX_Y,
				angle: 315,
				delay: 1,
				amount: 20,
				minSpeed: 1,
				maxSpeed: 2,
				maxAge: 20,
				deviation: 1
			});
		}, 10);
	}

	setupCursor() {
		// cursor entity
		this.cursor = new Entity();
		this.cursor.configSprite({
			sheet: "happy",
			offset: {
				x: 16,
				y: 8
			},
			animations: {
				default: "blank",
				blank: { frames: [0] },
				poop_idle: { frames: [1] },
				poop_left: { frames: [2] },
				poop_right: { frames: [3] },
			}
		});
		this.cursor.x = MAX_X / 2 - 16;
		this.cursor.y = 2;
		this.cursor.layer = 1;
		// wobble effect
		this.cursor.wobbleCount = 0;
		this.cursor.pivotPoint = { x: 16, y: 8 };
		this.cursor.update = function() {
			// if not idling, we wobble :)
			if (!this.isPlayingAnimation("blank")) {
				this.wobbleCount += 0.1;
				this.rotationDeg = 6 * Math.sin(this.wobbleCount);
			} else {
				this.rotationDeg = 0;
			}
		}

		this.add(this.cursor);
	}

	setupIntroTexts() {
		// help text
		this.helpText = new BitmapText({
			font: "font1",
			color: COLOR_TEXT,
			x: 16,
			y: MAX_Y / 2 - 16,
			leading: 2,
			text: helpMessage
		});
		this.add(this.helpText);

		// start message
		this.startMessage = new BitmapText({
			font: "font1",
			color: COLOR_TEXT,
			x: 44,
			y: this.helpText.y + 7 * 8,
			text: startMessage
		});

		const w = this.startMessage.getLocalBounds().width;
		this.startMessage.pivotPoint = { x: w / 2 };

		this.startMessage.x += w / 2;

		this.startMessage.wobbleCount = 0;
		this.startMessage.update = function() {
			this.wobbleCount += 0.05;
			let wobble = Math.sin(this.wobbleCount);
			this.rotationDeg = 4 * wobble;
			const scale = 1 + Math.abs(0.25 * wobble);
			this.scale = {x: scale, y: scale};
		}
		this.add(this.startMessage);
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

	createObstacles() {
		for (let i = 0; i < OBSTACLES_COUNT; i++) {
			let x = RNG.randomInteger(32, MAX_X - 32);
			let y = RNG.randomInteger(32, MAX_Y - 32);
			this.fillRect(x, y, RNG.randomInteger(10, 20), RNG.randomInteger(10, 20));
		}
	}

	fillRect(x, y, w, h) {
		for (let yy = y; yy < y + h; yy++) {
			for (let xx = x; xx < x + w; xx++) {
				this.fixPixel(xx, yy);
				let p = this.getParticle(xx, yy);
				p.tint = COLOR_OBSTACLES;
			}
		}
	}

	/**
	 * Physics simulation.
	 * Processes each sand-particle
	 */
	update() {
		// start game
		if (!this.started) {
			if (Keyboard.pressed(Keys.S)) {
				this.started = true;
				this.helpText.removeFromScreen();
				this.startMessage.removeFromScreen();
				this.cancelFrameEvent(this._introPoopInterval);
				this.createObstacles();
			} else {
				return;
			}
		}

		// move cursor
		let dir = "idle";
		if (Keyboard.wasPressedOrIsDown(Keys.LEFT)) {
			this.cursor.x--;
			dir = "left";
			this.particlePooper.emit({
				x: this.cursor.x + 25,
				y: this.cursor.y + 8,
				angle: 90
			});
		} else if (Keyboard.wasPressedOrIsDown(Keys.RIGHT)) {
			this.cursor.x++;
			dir = "right";
			this.particlePooper.emit({
				x: this.cursor.x + 7,
				y: this.cursor.y + 8,
				angle: 270
			});
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
			this.cursor.playAnimation({ name: `poop_${dir}` });
			this.spawnParticle(this.cursor.x + 16, this.cursor.y + 10);
			this.spawnParticle(this.cursor.x + 16 - 5, this.cursor.y+11);
			this.spawnParticle(this.cursor.x + 16 + 5, this.cursor.y+11);
		} else {
			this.cursor.playAnimation({ name: "blank" });
		}

		// physics simulation & particle collision
		this.activeParticles.forEach((p) => {

			// 1 particle below
			if (!this.isFree(p.x, p.y + 1)) {
				let dx = Math.random() > 0.5 ? 1 : -1;

				// check [1]: 1 down, 1 horizontal randomly
				if (this.isFree(p.x + dx, p.y + 1) && this.isFree(p.x + dx, p.y)) {
					p.x += dx;
					p.y += 1;
				} else if (this.isFree(p.x - dx, p.y + 1) && this.isFree(p.x - dx, p.y)){
					// check [2]: 1 down, 1 horizontal (other direction)
					p.x -= dx;
					p.y += 1;
				} else if (p.rolling > 0) {
					if (this.isFree(p.x + p.rollingDir, p.y)) {
						p.x += p.rollingDir;
					}
					p.rolling--;
				} else if (p.rolling == undefined) {
					p.rolling = RNG.randomInteger(1, 10);
					p.rollingDir = dx;
				} else {
					p.rolling = undefined;
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