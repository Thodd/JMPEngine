// JMP imports
import PIXI from "../../../src/core/PIXIWrapper.js";
import Screen from "../../../src/game/Screen.js";
import BitmapText from "../../../src/game/BitmapText.js";
import Keyboard from "../../../src/input/Keyboard.js";
import Keys from "../../../src/input/Keys.js";
import RNG from "../../../src/utils/RNG.js";

// game imports
import Constants from "./Constants.js";
import M4th from "./M4th.js";
import Helper from "../../../src/utils/Helper.js";
import FrameCounter from "../../../src/utils/FrameCounter.js";
import Entity from "../../../src/game/Entity.js";
import ParticleEmitter from "../../../src/game/ParticleEmitter.js";

/**
 * This project is a tech-demo of the Pseudo 3D canvas-based racer concept by Jake Gordon.
 * See: https://codeincomplete.com/articles/javascript-racer/ for a general overview of the tech
 * Code: https://github.com/jakesgordon/javascript-racer/
 * Licensing and attributions see below.
 * Some parts are taken as-is from Jakes project, others are modified and adapted or newly written by me (Thorsten Hochreuter).
 *
 * This project extends the original by PIXI.js based rendering.
 * Additional features include: tunnels, lap timing, graphical effects (e.g. car perspective), particle system.
 * Furthermore thanks to PIXI.js the project now uses WebGL for rendering.
 *
 * Everything in this project is available under "MIT License".
 *
 * This includes:
 * - race-track, perspective calculation and basic math implementation (Jake Gordon)
 * - Custom game coding (by Thorsten Hochreuter)
 * - The JMP Game Engine (by Thorsten Hochreuter)
 * - PIXI.js
 * - Graphics, sprites and sounds (by Thorsten Hochreuter)
 *
 * Graphics, sprites and sounds are created by me (Thorsten Hochreuter, https://github.com/Thodd).
 * The whole project was created with Visual Studio Code, Aseprite, 1BitDragon and Garageband on MacOS.
 *
 * See also the LICENSE file in the "/racer" folder.
 *
 * Further reading about pseudo 3D games from the good old times ;)
 *  - http://www.extentofthejam.com/pseudo/
 *  - http://reassembler.blogspot.com/
 *  - http://kometbomb.net/2016/04/03/how-does-pico-racer-work/
 */
class RaceTrack extends Screen {
	constructor() {
		super();

		// initial car direction
		this.dir = "idle";

		// time tracking
		this.timing = {
			maxLaps: 3,
			start: 0,
			current: 0,
			minutes: "00",
			seconds: "00",
			millis: "00",
			total: `00'00"00`,
			laptimes: []
		};

		// init basic values
		this.segments = [];
		this.cameraHeight = 350;
		this.cameraDepth = 1 / Math.tan((Constants.FOV/2) * Math.PI/180);
		this.playerX = 0;
		this.playerZ = (this.cameraHeight * this.cameraDepth);
		this.position = 0;
		this.speed = 0;

		this.bounceTimer = new FrameCounter(10);

		this.createTrack();

		this.initGFX();

		this.initParticleEmitters();

		this.render();
	}

	/**
	 * Creates the JMP Entities and PIXI rendering objects
	 */
	initGFX() {
		// Create Graphics entity
		let e = new Entity();
		this._gfx = new PIXI.Graphics();
		e.configSprite({
			replaceWith: this._gfx
		});
		e.layer = Constants.LAYERS.TRACK;
		this.add(e);

		// create a gradient as a texture for the sky
		let c = document.createElement("canvas");
		c.width = Constants.SCREEN_WIDTH * Constants.SCREEN_SCALE;
		c.width = Constants.SCREEN_HEIGHT * Constants.SCREEN_SCALE;
		let ctx = c.getContext("2d");
		let gradient = ctx.createLinearGradient(0,0,Constants.SCREEN_WIDTH,Constants.SCREEN_HEIGHT);
		gradient.addColorStop(0, "#010044");
		gradient.addColorStop(1, "#163d6d");
		ctx.fillStyle = gradient;
		ctx.fillRect(0, 0, Constants.SCREEN_WIDTH*2, Constants.SCREEN_HEIGHT*2);
		this._skyTexture = new PIXI.Texture.from(c);

		// Sprites

		// Car (body)
		this._racecarBody = new Entity();
		this._racecarBody.visible = false;
		this._racecarBody.configSprite({
			sheet: "racecar",
			animations: {
				default: "idle",
				idle: {
					frames: [3]
				}
			}
		});
		// this._racecarBody._pixiSprite.width *= 1.25;
		// this._racecarBody._pixiSprite.height *= 1.25;
		this._racecarBody.layer = Constants.LAYERS.CAR_BACK;
		this.add(this._racecarBody);

		// Car (front wheels)
		this._racecarFrontWheels = new Entity();
		this._racecarFrontWheels.visible = false;
		this._racecarFrontWheels.configSprite({
			sheet: "racecar",
			animations: {
				default: "idle",
				idle: {
					frames: [0]
				},
				roll_fast: {
					frames: [0,1,2],
					dt: 1
				},
				roll_mid: {
					frames: [0,1,2],
					dt: 3
				},
				roll_slow: {
					frames: [0,1,2],
					dt: 5
				}
			}
		});
		this._racecarFrontWheels.layer = Constants.LAYERS.CAR_FRONT;
		this.add(this._racecarFrontWheels);

		// Car (back wheels)
		this._racecarBackWheels = new Entity();
		this._racecarBackWheels.visible = false;
		this._racecarBackWheels.configSprite({
			sheet: "racecar",
			animations: {
				default: "idle",
				idle: {
					frames: [6]
				},
				roll_fast: {
					frames: [6,7,8],
					dt: 1
				},
				roll_mid: {
					frames: [6,7,8],
					dt: 3
				},
				roll_slow: {
					frames: [6,7,8],
					dt: 5
				},
			}
		});
		this._racecarBackWheels.layer = Constants.LAYERS.CAR_BACK;
		this.add(this._racecarBackWheels);

		// The sprite layer will initially z-sorts its entities.
		// This is a hack, because the JMP Engine doesn't normally account for the PIXI.js based z-sorting.
		// In the JMP Engine, the number of layers is typically limit as a design choice for each game individually.
		// The PIXI.js z-sorting only happens once initial, because the sprite's zIndex is not
		// modified afterwards. So no performance drawback.
		this._layers[Constants.LAYERS.THINGS].sortableChildren = true;

		// #UI Texts

		// Laps Count
		let lapsCount = new BitmapText({
			font: "vfr95_blue",
			text: `Lap:1/3`,
			x: 2,
			y: Constants.SCREEN_HEIGHT-10
		});
		lapsCount.layer = Constants.LAYERS.UI;
		this.add(lapsCount);

		// Laps timing
		let lapsTiming = new BitmapText({
			font: "vfr95_blue",
			text: `#0: ${this.timing.total}`,
			x: 2,
			y: 2
		});
		lapsTiming.layer = Constants.LAYERS.UI;
		this.add(lapsTiming);

		//static "km/h" text
		let kmhTextFixed = new BitmapText({
			font: "font1",
			x: Constants.SCREEN_WIDTH - 34,
			y: Constants.SCREEN_HEIGHT - 10,
			text: "km/h"
		});
		this.add(kmhTextFixed);

		// dynamic speed string
		let tachoOffsetX = Constants.SCREEN_WIDTH - 28;
		let currentSpeed = new BitmapText({
			font: "font1",
			x: tachoOffsetX - 2,
			y: Constants.SCREEN_HEIGHT-20,
			text: "000"
		});
		currentSpeed.layer = Constants.LAYERS.UI;
		this.add(currentSpeed);

		// tachometer box
		let tachoBox = new Entity();
		tachoBox.configSprite({
			sheet: "tacho"
		});
		tachoBox.active = false;
		tachoBox.visible = false;
		tachoBox.layer = Constants.LAYERS.UI;
		tachoBox.alpha = 0.5;
		tachoBox.x = tachoOffsetX;
		tachoBox.y = Constants.SCREEN_HEIGHT - 70;
		this.add(tachoBox);

		let tachoBoxMask = new PIXI.Graphics();

		let tacho = {
			currentSpeed,
			tachoBox,
			tachoBoxMask,
			kmhTextFixed
		};

		this._ui = {
			lapsCount,
			lapsTiming,
			tacho
		};
	}

	initParticleEmitters() {

		// particle emitter for dirt effect
		this.roadParticles = new ParticleEmitter({
			sheet: "particles",
			colors: [0x222222, 0x5f574f, 0xc2c3c7, 0xfff1e8],
			angle: 180,
			maxAge: 10,
			amount: 5,
			maxRadius: 3
		});
		this.roadParticles.layer = Constants.LAYERS.PARTICLES;
		this.add(this.roadParticles);

		// particle emitter for spark effect
		this.sparkParticles = new ParticleEmitter({
			sheet: "particles",
			colors: [0xff004d, 0xffa300, 0xffec27],
			angle: 180,
			maxAge: 10,
			amount: 5,
			maxRadius: 3,
			deviation: 10
		});
		this.sparkParticles.layer = Constants.LAYERS.PARTICLES;
		this.add(this.sparkParticles);

		// fireworks emitter for finishing the last lap
		this.fireworksEmitter = new ParticleEmitter({
			sheet: "particles",
			gravity: 0.3,
			delay: 1,
			amount: 30,
			maxAge: 20,
			deviation: 1,

			maxRadius: 2,

			minSpeed: 2,
			maxSpeed: 4,

			angle: 0,

			colors: [0xff004d, 0xffa300, 0xffec27, 0xc2c3c7, 0xfff1e8]
		});
		this.fireworksEmitter.layer = Constants.LAYERS.FIREWORKS;
		this.add(this.fireworksEmitter);
	}

	/**
	 * Check if the player presses ENTER to start the race.
	 */
	checkGameStart() {
		if (!this.started) {
			if (Keyboard.down(Keys.ENTER)) {
				this.render();
				this.started = true;
				this.timing.start = performance.now();
			}
		}
	}

	/**
	 * Evaluate lap time based on a checkpoint
	 */
	clearCheckpoint() {
		if (!this.finished) {
			// find player segment first
			let playerSegment = this.findSegment(this.position + this.playerZ);

			// We check if the player has crossed 3 specific segments at the halfway point of the track.
			// If so, we set a flag that the checkpoint was cleared and the next time the
			// player passes the first 3 segments of the track we consider the lap completed.
			// This checkpoint system prevents us from counting a lap multiple times when two update loops
			// happen while the player is on the goal segment.
			// This might happen if the player is driving slowly through the goal.
			let checkpointMark = Math.floor(this.segments.length/2);

			// checkpoint section
			if (playerSegment.index >= checkpointMark && playerSegment.index <= checkpointMark+3) {
				this.checkpointCleared = true;
			}

			// start/goal section
			if (playerSegment.index >= 0 && playerSegment.index <= 3 && this.checkpointCleared) {

				// we finished the last lap
				if (this.timing.laptimes.length+1 == this.timing.maxLaps) {
					this.finished = true;
				} else {
					// reset the lap timer
					this.timing.start = this.timing.current;

					// track the lap time for the UI
					this.timing.laptimes.unshift({
						lap: this.timing.laptimes.length+1,
						time: this.timing.total
					});

					// and of course we need to reset the checkpoint
					this.checkpointCleared = false;
				}

			}
		}
	}

	/**
	 * Tracks laptime.
	 */
	trackTime() {
		this.timing.current = performance.now();
		let elapsedSeconds  = (this.timing.current - this.timing.start) / 1000;

		let minutes = (elapsedSeconds / 60) >> 0;
		let seconds = elapsedSeconds - (minutes * 60) >> 0;
		let millis  = (elapsedSeconds % 1) * 100 >> 0;

		this.timing.minutes = `${minutes}`.padStart(2, "0");
		this.timing.seconds = `${seconds}`.padStart(2, "0");
		this.timing.millis  = `${millis}`.padStart(2, "0");
		this.timing.total   = `${this.timing.minutes}'${this.timing.seconds}"${this.timing.millis}`;
	}

	/**
	 * Trigger "you are the best player ever" fireworks.
	 * Nudges the player to be happy. Good job. Everybody clap.
	 */
	showFireworks() {
		if (!this.fireWorkInterval) {
			let w = this.getWidth();
			let h = this.getHeight();
			this.fireWorkInterval = this.registerFrameEventInterval(() => {
				this.fireworksEmitter.emit({
					x: RNG.randomInteger(10, w - 10),
					y: RNG.randomInteger(10, h - 10),
				});
			}, 10);
		}
	}

	/**
	 * Basic Update loop.
	 * Handles input, rerendering and state checks.
	 */
	update() {
		this.checkGameStart();
		this.clearCheckpoint();

		// do nothing until the player presses ENTER
		if (!this.started) {
			return;
		}

		// we only track time while the race is on
		if (!this.finished) {
			this.trackTime();
		} else {
			this.showFireworks();
		}

		this.updateUI();

		// find player segment first
		let playerSegment = this.findSegment(this.position + this.playerZ);
		let dx = Constants.FRAME_TIME / 1000;

		// check if we "animate" a bounce back onto the road
		if (this.bounce) {
			if (this.bounceTimer.isReady()) {
				this.speed = 0;
				this.bounce = false;
				this.bounceTimer.reset();
			}
			this.playerX = this.playerX - dx * 6 * this.bounceDir;
			this.position = M4th.increase(this.position, Constants.FRAME_TIME * this.speed, this.trackLength);
			this.render();
			return;
		}

		// check horizontal movement
		// we can always move horizontally since it makes for a more fun arcade game
		if (!this.finished) {
			if (Keyboard.down(Keys.LEFT)) {
				this.playerX = this.playerX - dx;
				this.dir = "left";
			} else if (Keyboard.down(Keys.RIGHT)) {
				this.playerX = this.playerX + dx;
				this.dir = "right";
			} else {
				this.dir = "idle";
			}

			// Apply centrifugal force based on curve and the current speed:
			// If the player has no speed we of course don't apply any additional force
			let speedPercent  = Math.max(0, this.speed/Constants.SPEED_MAX);
			this.playerX = this.playerX - (dx * speedPercent * playerSegment.curve * Constants.CENTRIFUGAL_FORCE);

			// handle acceleration and deceleration
			if (Keyboard.down(Keys.UP)) {
				this.speed = M4th.accelerate(this.speed, Constants.ACCELERATION, Constants.FRAME_TIME);
			} else if ((Keyboard.down(Keys.DOWN) || Keyboard.down(Keys.SPACE))) {
				this.speed = M4th.accelerate(this.speed, Constants.BREAKING, Constants.FRAME_TIME);
				this.speed = M4th.limit(this.speed, 0, Constants.SPEED_MAX);
			} else {
				// no pedal pressed: decelerate slowly
				this.speed = M4th.accelerate(this.speed, Constants.DECELERATION, Constants.FRAME_TIME);
				this.speed = M4th.limit(this.speed, 0, Constants.SPEED_MAX);
			}
		} else {
			// slowly roll to a stop after finishing the race
			this.speed = M4th.accelerate(this.speed, Constants.DECELERATION, Constants.FRAME_TIME);
			this.speed = M4th.limit(this.speed, 0, Constants.SPEED_MAX);
		}

		// decelerate if the player is off the road
		if (((this.playerX < -1) || (this.playerX > 0.9)) && (this.speed > Constants.OFF_ROAD_SPEED_LIMIT)) {
			this.speed = M4th.accelerate(this.speed, -this.speed/500, Constants.FRAME_TIME);
		}

		// collision detection
		for(let n = 0 ; n < playerSegment.sprites.length ; n++) {
			let sprite  = playerSegment.sprites[n];
			let collisionDataLen = sprite.collisionData.length;

			// there might be multiple collision sets
			// e.g. for the sides of a tunnel
			if (collisionDataLen > 0) {
				for (let i = 0; i < collisionDataLen; i++) {
					let collisionData = sprite.collisionData[i];
					if (collisionData) {
						if (M4th.collides(this.playerX, 0.3, collisionData.x, collisionData.w)) {
							// bounce back
							this.bounce = true;
							this.bounceDir = Math.sign(this.playerX);
							this.speed = Constants.DECELERATION;
							break;
						}
					}
				}
			}
		}

		// clamp speed
		this.speed = M4th.limit(this.speed, -Constants.SPEED_MAX/4, Constants.SPEED_MAX);

		// finally update the player position on the track
		this.position = M4th.increase(this.position, Constants.FRAME_TIME * this.speed, this.trackLength);

		// and now we rerender the road
		this.render();
	}

	/**
	 * Updates the UI, e.g. HUD
	 */
	updateUI() {
		// laps
		let laps = this.timing.laptimes.length + 1;
		this._ui.lapsCount.setText(`Lap:${laps}/${this.timing.maxLaps}`);

		// timing
		let lapTimingString = `#${laps}: ${this.timing.total}`;

		for (let i = 0; i < this.timing.laptimes.length; i++) {
			// alpha(1/(i+2)) ???
			let timing = this.timing.laptimes[i];
			lapTimingString += `\n#${timing.lap}: ${timing.time}`;
		}
		this._ui.lapsTiming.setText(lapTimingString);

		// tacho and speed number
		let speedPercent  = Math.max(0, this.speed/Constants.SPEED_MAX);
		let kmhStr = `${Math.ceil(350*speedPercent)}`.padStart(3, "0");
		let fill = Math.ceil(speedPercent * 60);
		let tachoHeight = Constants.SCREEN_HEIGHT - fill;
		this._ui.tacho.currentSpeed.setText(kmhStr);
		this._ui.tacho.currentSpeed.y = tachoHeight - 20;

		// fill tacho
		this._ui.tacho.tachoBox.visible = true;

		// this is some rather dirty PIXI mask magic :D
		// but good enough for a simple game like this
		this._ui.tacho.tachoBoxMask.clear();
		this._ui.tacho.tachoBoxMask.beginFill(0x000000);
		this._ui.tacho.tachoBoxMask.drawRect(this._ui.tacho.tachoBox.x, this._ui.tacho.tachoBox.y + 60 - fill, 22, fill);
		this._ui.tacho.tachoBoxMask.endFill();
		this._ui.tacho.tachoBox._pixiSprite.mask = this._ui.tacho.tachoBoxMask;
	}

	/**
	 * Simple collision check
	 */
	collides(x1, w1, x2, w2) {
		if (x1 < x2 + w2 &&
			x1 + w1 > x2) {
				return true;
		}
		return false;
	}

	/**
	 * Creates a JMP Engine Entity for a roadside sprite.
	 * These entities take care of positioning and scaling.
	 */
	createSpriteEntity(spec) {
		let e = new Entity();
		e.configSprite({
			sheet: spec.sheet,
			id: spec.id
		});
		e.visible = false;
		e.active = false;
		e.layer = Constants.LAYERS.THINGS;
		e._pixiSprite.zIndex = spec.zIndex;
		this.add(e);
		Object.assign(e, spec);
		return e;
	}

	/**
	 * Adds a new segment to the track
	 * @param {number} curve curvature of the segment
	 * @param {int} y y position
	 */
	addSegment(curve, y) {
		let n = this.segments.length;
		let zIndex = 1000 - n;
		let alternate = Math.floor(n/Constants.RUMBLE_LENGTH)%2;
		let lastY = this.lastY();

		// define the styling of the slope wrt to the previous segment
		// used to render a uphill/downhill effect
		let slopeStyle = "flat";
		if (y > lastY) {
			slopeStyle = "uphill";
		} else if (y < lastY) {
			slopeStyle = "downhill";
		}

		this.segments.push({
			index: n,
				p1: { world: {y: lastY, z: n * Constants.SEGMENT_LENGTH },     camera: {}, screen: {} },
				p2: { world: {y: y,            z: (n+1) * Constants.SEGMENT_LENGTH }, camera: {}, screen: {} },
			curve: curve,
			slopeStyle: slopeStyle,
			color: alternate ? Constants.COLORS.DARK : Constants.COLORS.LIGHT,
			sprites: [],
			looped: false,
			laps: 0,
		});

		// spectators
		if ((n >= 100 && n < 200) || (n >= 2000 && n < 2300) || (n >= 4000 && n < 4200)) {
			if (n%10 == 0) {
				let sprLeft = this.createSpriteEntity({
					sheet: "sprites",
					id: 3,
					zIndex: zIndex,
					offset: Helper.choose([-1.25, - 1.5, -1.75, -2]),
					w: 100,
					h: 100,
					scale: 0.006,
					collisionData: []
				});
				sprLeft.collisionData.push({
					x: -2,
					w: 1.2
				});
				this.segments[n].sprites.push(sprLeft);

				let sprRight = this.createSpriteEntity({
					sheet: "sprites",
					id: 2,
					zIndex: zIndex,
					offset: Helper.choose([1.25, 1.5, 1.75, 2]),
					w: 100,
					h: 100,
					scale: 0.006,
					collisionData: []
				});
				sprRight.collisionData.push({
					x: 2,
					w: 1.2
				});
				this.segments[n].sprites.push(sprRight);
			}
		} else if ((n > 300 && n < 400) || (n > 500 && n < 700) || (n > 3700 && n < 4000)) {
			// three tunnels
			this.segments[n].color = alternate ? Constants.COLORS.TUNNEL_DARK : Constants.COLORS.TUNNEL_LIGHT;
			this.segments[n].sprites.push(this.createSpriteEntity({
				sheet: "tunnel",
				id: 0,
				zIndex: zIndex,
				offset: -3,
				// for collision we only care about the horizontal dimensions of the sprite...
				w: 600,
				// ... for depth scaling however we also need the height
				h: 130,
				scale: 0.01,
				collisionData: [{
					x: -1.6,
					w: 30 * 0.01
				},
				{
					x: 1.6,
					w: 30 * 0.01
				}]
			}));
		} else if (n%200 == 0) {
			let sprLeft = this.createSpriteEntity({
				sheet: "advertisement",
				id: Helper.choose([0, 1, 2, 3]),
				zIndex: zIndex,
				offset: Helper.choose([-1.25, - 1.5, -1.75]),
				w: 100,
				h: 100,
				scale: 0.003*2,
				collisionData: []
			});
			let sprScaledWidth = sprLeft.w * sprLeft.scale;
			sprLeft.collisionData.push({
				x: sprLeft.offset + sprScaledWidth * Math.sign(sprLeft.offset),
				w: sprScaledWidth
			});
			this.segments[n].sprites.push(sprLeft);
		}  else if (n%350 == 0) {
			let sprRight = this.createSpriteEntity({
				sheet: "advertisement",
				id: Helper.choose([0, 1, 2, 3]),
				zIndex: zIndex,
				offset: Helper.choose([1.25, 1.5, 1.75]),
				w: 100,
				h: 100,
				scale: 0.006,
				collisionData: []
			});
			let sprScaledWidth = sprRight.w * sprRight.scale;
			sprRight.collisionData.push({
				x: sprRight.offset + sprScaledWidth * Math.sign(sprRight.offset),
				w: sprScaledWidth
			});
			this.segments[n].sprites.push(sprRight);
		} else {
			if (n%5 == 0) {
				let sprLeft = this.createSpriteEntity({
					sheet: "sprites",
					id: Helper.choose([0, 0, 0, 1]),
					zIndex: zIndex,
					offset: Helper.choose([-1.25, - 1.5, -1.75, -2, -2.5, -3, -4]),
					w: 100,
					h: 100,
					scale: Helper.choose([0.003, 0.01, 0.008, 0.015]),
					collisionData: []
				});
				let sprScaledWidth = sprLeft.w * sprLeft.scale;
				sprLeft.collisionData.push({
					x: sprLeft.offset + sprScaledWidth * Math.sign(sprLeft.offset),
					w: sprScaledWidth
				});
				this.segments[n].sprites.push(sprLeft);

				let sprRight = this.createSpriteEntity({
					sheet: "sprites",
					id: Helper.choose([0, 0, 0, 1]),
					zIndex: zIndex,
					offset: Helper.choose([1.25, 1.5, 1.75, 2, 2.5, 3, 4]),
					w: 100,
					h: 100,
					scale: Helper.choose([0.003, 0.01, 0.008, 0.015]),
					collisionData: []
				});
				sprScaledWidth = sprRight.w * sprRight.scale;
				sprRight.collisionData.push({
					x: sprRight.offset + sprScaledWidth * Math.sign(sprRight.offset),
					w: sprScaledWidth
				});
				this.segments[n].sprites.push(sprRight);
			}
		}
	}

	// retrieve the y value (road-height) of the last added road segment
	lastY() {
		return (this.segments.length == 0) ? 0 : this.segments[this.segments.length-1].p2.world.y;
	}

	addRoad(enter, hold, leave, curve, y) {
		y = y || 0;
		let startY = this.lastY();
		let endY = startY + (y * Constants.SEGMENT_LENGTH);
		let total = enter + hold + leave;

		for(let n = 0 ; n < enter ; n++) {
			this.addSegment(M4th.easeIn(0, curve, n/enter), M4th.easeInOut(startY, endY, n/total));
		}
		for(let n = 0 ; n < hold  ; n++) {
			this.addSegment(curve, M4th.easeInOut(startY, endY, (enter+n)/total));
		}
		for(let n = 0 ; n < leave ; n++) {
			this.addSegment(M4th.easeInOut(curve, 0, n/leave), M4th.easeInOut(startY, endY, (enter+hold+n)/total));
		}
	}

	/**
	 * Creates the segments for the race track.
	 */
	createTrack() {
		//straight and easy curve
		this.addRoad(100,  75, 50, 0,  0);			//   0
		this.addRoad(50, 100, 50, 2, 75);			//  75

		// chicane
		this.addRoad(100, 100, 100, -2,  50);		// 125
		this.addRoad(50, 50, 50,  0, -25);			// 100
		this.addRoad(50, 50, 50,  2,   0);			// 100

		// sharp left
		this.addRoad(100, 50, 100, -4, 50);			// 150

		// climp (forest)
		this.addRoad(50, 50, 50,  0,  -40);			// 110
		this.addRoad(100, 50, 50,   2,  -50);		//  60

		this.addRoad(100, 100, 100, -2, +50);		// 110

		// chicane
		this.addRoad(100, 100, 50, -3.5, 25);		// 135
		this.addRoad(20,   20, 20,  0,    0);		// 135
		this.addRoad(100, 100, 50, 3.5, 25);		// 160

		// short straight
		this.addRoad(100, 100, 100, 0, -70);		//  90

		// slow left
		this.addRoad(100, 70, 50, -3.5,  30);		// 120

		// easy chicanes
		this.addRoad(100,  50,  50,  -2,  -20);		// 100
		this.addRoad(100,  50,  50,   2,  -20);		//  80
		this.addRoad(50,   50,  50,   0,  -20);		//  60
		this.addRoad(50,   50,  50,   2,  -10);		//  50
		this.addRoad(50,   50,  50,  -2,  -10);		//  40
		this.addRoad(100, 100,  50,   0,  -50);		// -10
		this.addRoad(100,  50, 100,   4,   50);		//  40

		// short straight
		this.addRoad(50,   50,  50,  0,    0);		//  40

		// last easy chicane
		this.addRoad(50,   50,   50,   1,  -30);	//  10
		this.addRoad(50,   50,   50,  -1,  -40);	// -20

		// final stretch
		this.addRoad(50,   50,   50,   0,  30);		//   0

		this.segments[this.findSegment(this.playerZ).index + 2].color = Constants.COLORS.START;
		this.segments[this.findSegment(this.playerZ).index + 3].color = Constants.COLORS.START;
		for(var n = 0 ; n < Constants.RUMBLE_LENGTH ; n++) {
			this.segments[this.segments.length-1-n].color = Constants.COLORS.GOAL;
		}

		this.trackLength = this.segments.length * Constants.SEGMENT_LENGTH;
	}

	addStraight(num) {
		num = num || Constants.ROAD.LENGTH.MEDIUM;
		this.addRoad(num, num, num, 0, 0);
	}

	addCurve(num, curve) {
		num    = num    || Constants.ROAD.LENGTH.MEDIUM;
		curve  = curve  || Constants.ROAD.CURVE.MEDIUM;
		let height = height || Constants.ROAD.HILL.NONE;
		this.addRoad(num, num, num, curve, height);
	}

	addHill(num, height) {
		num    = num    || Constants.ROAD.LENGTH.MEDIUM;
		height = height || Constants.ROAD.HILL.MEDIUM;
		this.addRoad(num, num, num, 0, height);
	}

	addSCurves() {
		this.addRoad(Constants.ROAD.LENGTH.MEDIUM, Constants.ROAD.LENGTH.MEDIUM, Constants.ROAD.LENGTH.MEDIUM,  -Constants.ROAD.CURVE.EASY,      Constants.ROAD.HILL.NONE);
		this.addRoad(Constants.ROAD.LENGTH.MEDIUM, Constants.ROAD.LENGTH.MEDIUM, Constants.ROAD.LENGTH.MEDIUM,   Constants.ROAD.CURVE.MEDIUM,    Constants.ROAD.HILL.MEDIUM);
		this.addRoad(Constants.ROAD.LENGTH.MEDIUM, Constants.ROAD.LENGTH.MEDIUM, Constants.ROAD.LENGTH.MEDIUM,   Constants.ROAD.CURVE.EASY,     -Constants.ROAD.HILL.LOW);
		this.addRoad(Constants.ROAD.LENGTH.MEDIUM, Constants.ROAD.LENGTH.MEDIUM, Constants.ROAD.LENGTH.MEDIUM,  -Constants.ROAD.CURVE.EASY,      Constants.ROAD.HILL.MEDIUM);
		this.addRoad(Constants.ROAD.LENGTH.MEDIUM, Constants.ROAD.LENGTH.MEDIUM, Constants.ROAD.LENGTH.MEDIUM,  -Constants.ROAD.CURVE.MEDIUM,   -Constants.ROAD.HILL.MEDIUM);
		this.addRoad(Constants.ROAD.LENGTH.MEDIUM, Constants.ROAD.LENGTH.MEDIUM, Constants.ROAD.LENGTH.MEDIUM,   Constants.ROAD.CURVE.NONE,      Constants.ROAD.HILL.LOW);
	}

	/**
	 * Finds the segment at the respective (z) position
	 * @param {int} z (z) position
	 * @returns the segment at (z)
	 */
	findSegment(z) {
		return this.segments[Math.floor(z/Constants.SEGMENT_LENGTH) % this.segments.length];
	}

	/**
	 * Stupidly simple polygon rendering ;)
	 */
	polyf(p1, p2, p3, p4, color) {
		this._gfx.beginFill(color);
		this._gfx.moveTo(p1.x, p1.y);
		this._gfx.lineTo(p2.x, p2.y);
		this._gfx.lineTo(p3.x, p3.y);
		this._gfx.lineTo(p4.x, p4.y);
	}

	/**
	 * Renders a segment based on the given definition
	 */
	renderSegment(width, lanes, x1, y1, w1, x2, y2, w2, fog, color) {
		let lanew1, lanew2, lanex1, lanex2, lane;

		let r1 = this.calculateRumbleWidth(w1, lanes);
		let r2 = this.calculateRumbleWidth(w2, lanes);

		let l1 = this.calculateLaneMarkerWidth(w1, lanes)*2;
		let l2 = this.calculateLaneMarkerWidth(w2, lanes)*2;

		// grass
		this._gfx.beginFill(color.grass);
		this._gfx.drawRect(0, y2, width, y1 - y2);

		// road & rumble
		this.polyf({x:x1-w1-r1, y:y1}, {x:x1-w1, y:y1}, {x:x2-w2, y:y2}, {x:x2-w2-r2, y:y2}, color.rumble);
		this.polyf({x:x1+w1+r1, y:y1}, {x:x1+w1, y:y1}, {x:x2+w2, y:y2}, {x:x2+w2+r2, y:y2}, color.rumble);
		this.polyf({x:x1-w1,    y:y1}, {x:x1+w1, y:y1}, {x:x2+w2, y:y2}, {x:x2-w2,    y:y2}, color.road);

		// lane
		if (color.lane) {
			lanew1 = w1*2/lanes;
			lanew2 = w2*2/lanes;
			lanex1 = x1 - w1 + lanew1;
			lanex2 = x2 - w2 + lanew2;
			for(lane = 1 ; lane < lanes ; lanex1 += lanew1, lanex2 += lanew2, lane++) {
				this.polyf({x:lanex1 - l1/2, y:y1}, {x:lanex1 + l1/2, y:y1}, {x:lanex2 + l2/2, y:y2}, {x:lanex2 - l2/2, y:y2}, color.lane);
			}
		}

		// render some fog in the distance to mask artifacts, silent hill style ;)
		if (fog < 1) {
			this._gfx.beginFill(Constants.COLORS.FOG, 1-fog);
			this._gfx.drawRect(0, y1, width, y2-y1);
		}
	}

	calculateRumbleWidth(projectedRoadWidth, lanes) {
		return projectedRoadWidth/Math.max(6,  2*lanes);
	}

	calculateLaneMarkerWidth(projectedRoadWidth, lanes) {
		return projectedRoadWidth/Math.max(32, 8*lanes);
	}

	/**
	 * Actively called render function.
	 * Deviates from the JMP Engine's entity-based render mechanism,
	 * since we need to draw polygons and sprites manually.
	 */
	render() {
		let baseSegment = this.findSegment(this.position);
		let basePercent = M4th.percentRemaining(this.position, Constants.SEGMENT_LENGTH);

		var playerSegment = this.findSegment(this.position + this.playerZ);
		var playerPercent = M4th.percentRemaining(this.position + this.playerZ, Constants.SEGMENT_LENGTH);
		var playerY       = M4th.interpolate(playerSegment.p1.world.y, playerSegment.p2.world.y, playerPercent)

		let maxy        = Constants.SCREEN_HEIGHT;

		let x  = 0;
		let dx = -(baseSegment.curve * basePercent);

		// reset screen before drawing
		this._gfx.clear();

		// render Sky BG
		this._gfx.beginTextureFill({texture: this._skyTexture});
		this._gfx.drawRect(0, 0, Constants.SCREEN_WIDTH*Constants.SCREEN_SCALE, Constants.SCREEN_HEIGHT*Constants.SCREEN_SCALE);

		for(let n = 0 ; n < Constants.RENDER_DISTANCE ; n++) {
			let segment    = this.segments[(baseSegment.index + n) % this.segments.length];
			segment.looped = segment.index < baseSegment.index;
			segment.fog    = M4th.exponentialFog((n/1.5)/Constants.RENDER_DISTANCE, Constants.FOG_THICKNESS);
			segment.clip = maxy;

			M4th.project(segment.p1, (this.playerX * Constants.ROAD_WIDTH) - x,      playerY + this.cameraHeight, this.position - (segment.looped ? this.trackLength : 0), this.cameraDepth, Constants.SCREEN_WIDTH, Constants.SCREEN_HEIGHT, Constants.ROAD_WIDTH);
			M4th.project(segment.p2, (this.playerX * Constants.ROAD_WIDTH) - x - dx, playerY + this.cameraHeight, this.position - (segment.looped ? this.trackLength : 0), this.cameraDepth, Constants.SCREEN_WIDTH, Constants.SCREEN_HEIGHT, Constants.ROAD_WIDTH);

			x  = x + dx;
			dx = dx + segment.curve;

			if ((segment.p1.camera.z <= this.cameraDepth) || // behind us
				(segment.p2.screen.y >= segment.p1.screen.y) || // back face cull
				(segment.p2.screen.y >= maxy)) {        // clip by (already rendered) segment
				continue;
			}

			this.renderSegment(Constants.SCREEN_WIDTH, Constants.NUMBER_OF_LANES,
							segment.p1.screen.x,
							segment.p1.screen.y,
							segment.p1.screen.w,
							segment.p2.screen.x,
							segment.p2.screen.y,
							segment.p2.screen.w,
							segment.fog,
							segment.color);

			maxy = segment.p2.screen.y;
		}

		// sprites
		//for(let n = ((drawDistance*0.8)-1) ; n > 0 ; n--) {
		for(let n = 0; n < ((Constants.RENDER_DISTANCE*0.8)-1); n++) {
			let segment = this.segments[(baseSegment.index + n) % this.segments.length];

			for(let i = 0 ; i < segment.sprites.length ; i++) {

				let sprite      = segment.sprites[i];
				let spriteWidth = sprite.w;
				let spriteHeight = sprite.h;
				let spriteScale = segment.p1.screen.scale;
				let spriteX;
				let spriteY     = segment.p1.screen.y;

				if (sprite.sheet == "tunnel") {
					// shift the tunnels a bit, since the opening is in the middle of the sprite
					spriteX = segment.p1.screen.x - (spriteScale * sprite.offset * Constants.ROAD_WIDTH * Constants.SCREEN_WIDTH);
				} else {
					spriteX     = segment.p1.screen.x + (spriteScale * sprite.offset * Constants.ROAD_WIDTH * Constants.SCREEN_WIDTH/2);
				}

				let destW  = Math.floor((spriteWidth * spriteScale * Constants.SCREEN_WIDTH) * (sprite.scale * Constants.ROAD_WIDTH));
				let destH  = Math.floor((spriteHeight * spriteScale * Constants.SCREEN_WIDTH) * (sprite.scale * Constants.ROAD_WIDTH));

				let clipY = segment.clip;

				// offsetting and scaling a sprite
				let offsetX = (sprite.offset < 0 ? -1 : 0);
				let offsetY = -1
				let destX = spriteX + (destW * (offsetX || 0));
				let destY = spriteY + (destH * (offsetY || 0));

				var clipH = clipY ? Math.max(0, destY+destH-clipY) : 0;
				if (clipH < destH) {
					if (sprite instanceof Entity) {
						sprite.visible = true;
						sprite.x = Math.floor(destX);
						sprite.y = Math.floor(destY);
						sprite._pixiSprite.width = destW;
						sprite._pixiSprite.height = (destH - clipH);
					}
				} else {
					if (sprite instanceof Entity) {
						sprite.visible = false;
					}
				}
			}

			// Care placement & animation
			if (segment == playerSegment) {
				let carW = 128;
				let carH = 48;

				// the wheels are shifted based on the curve to give the car a bit of perspective
				let wheelShift = segment.curve;

				// bob a bit during racing
				let bobble = 0;

				// shift the wheel base up or down depending on the slope style
				let bodyShift = 0;
				if (segment.slopeStyle == "uphill") {
					bodyShift = 2;
				} else if (segment.slopeStyle == "downhill") {
					bodyShift = -2;
				}

				// position the car
				this._racecarBody.visible = true;
				this._racecarBody.x = Constants.SCREEN_WIDTH/2 - carW/2;
				this._racecarBody.y = Constants.SCREEN_HEIGHT - carH - 10;

				this._racecarFrontWheels.visible = true;
				this._racecarFrontWheels.x = Constants.SCREEN_WIDTH/2 - carW/2 + wheelShift * 3;
				this._racecarFrontWheels.y = Constants.SCREEN_HEIGHT - carH - 10 - bodyShift;

				this._racecarBackWheels.visible = true;
				this._racecarBackWheels.x = Constants.SCREEN_WIDTH/2 - carW/2 - wheelShift * 2;
				this._racecarBackWheels.y = Constants.SCREEN_HEIGHT - carH - 10 + bodyShift;

				// change animation based on speed
				let emitParticles = false;
				let speedPercent = (this.speed/Constants.SPEED_MAX) * 100;
				let anim = "idle";
				if (speedPercent < 1) {
					anim = "idle";
				} else {
					bobble = Helper.choose([0,1]);
					if (speedPercent < 20) {
						anim = "roll_slow";
					} else if (speedPercent < 50) {
						emitParticles = true;
						anim = "roll_mid";
					} else if (speedPercent <= 100) {
						emitParticles = true;
						anim = "roll_fast";
					}
				}

				// emitting particles only while we have some form of speed
				if (emitParticles) {
					// drifting through a curve always renders particles
					if (wheelShift) {
						// left tire
						this.roadParticles.emit({
							x: this._racecarBackWheels.x + 20,
							y: this._racecarBackWheels.y + 30,
							angle: 180 + wheelShift * 10
						});
						// right tire
						this.roadParticles.emit({
							x: this._racecarBackWheels.x + carW - 20,
							y: this._racecarBackWheels.y + 30,
							angle: 180 + wheelShift * 10
						});
					} else {
						// left tire
						this.roadParticles.emit({
							x: this._racecarBackWheels.x + 20,
							y: this._racecarBackWheels.y + 15,
							angle: 180 + wheelShift * 10
						});
						// right tire
						this.roadParticles.emit({
							x: this._racecarBackWheels.x + carW - 20,
							y: this._racecarBackWheels.y + 15,
							angle: 180
						});
					}

					// sparks on the bottom of the car
					if (anim == "roll_fast" && wheelShift == 0 && Math.random() < 0.01) {
						this.sparkParticles.emit({
							x: this._racecarBackWheels.x + carW/2,
							y: this._racecarBackWheels.y + 30,
						});
					}
				}

				// bobble
				this._racecarBody.y -= bobble;
				this._racecarFrontWheels.y -= bobble;
				this._racecarBackWheels.y -= bobble;

				// wheel rolling animations
				this._racecarFrontWheels.playAnimation({name: anim});
				this._racecarBackWheels.playAnimation({name: anim});
			}
		}
	}
}

export default RaceTrack;