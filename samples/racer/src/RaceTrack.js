import PIXI from "../../../src/core/PIXIWrapper.js";
import Manifest from "../../../src/assets/Manifest.js";
import Screen from "../../../src/game/Screen.js";
import BitmapText from "../../../src/game/BitmapText.js";
import Engine from "../../../src/core/Engine.js";
import Keyboard from "../../../src/input/Keyboard.js";
import Keys from "../../../src/input/Keys.js";

import M4th from "./M4th.js";
import Helper from "../../../src/utils/Helper.js";
import FrameCounter from "../../../src/utils/FrameCounter.js";
import Entity from "../../../src/game/Entity.js";

const width = Manifest.get("/w");
const height = Manifest.get("/h");
const scale = Manifest.get("/scale");
const timePerFrame = 16.7;

let dt = 16.7;
const segments = [];
const roadWidth     = 700;                    // actually half the roads width, easier math if the road spans from -roadWidth to +roadWidth
const segmentLength = 100;                     // length of a single segment
const rumbleLength  = 4;                       // number of segments per red/white rumble strip
const lanes         = 2;                       // number of lanes
const fieldOfView   = 100;                     // angle (degrees) for field of view
const drawDistance  = 300;                     // number of segments to draw
const fogDensity    = 5;                       // exponential fog density
const maxSpeed      = (segmentLength * 1.5)/timePerFrame;      // top speed (ensure we can't move more than 1 segment in a single frame to make collision detection easier)
const centrifugal   = 0.65;
const accel         =  maxSpeed/2000;             // acceleration rate - tuned until it 'felt' right
const breaking      = -maxSpeed/1000;               // deceleration rate when braking
const decel         = -maxSpeed/2000;             // 'natural' deceleration rate when neither accelerating, nor braking
const offRoadLimit  =  maxSpeed/3000;

const PLAYER_SCALE = 0.3 * (1/86);
const playerW = 86 * PLAYER_SCALE;

let cameraHeight  = 700;                    // z height of camera
let trackLength   = null;                    // z length of entire track (computed)
let cameraDepth   = null;                    // z distance camera is from screen (computed)
let playerX       = 0;                       // player x offset from center of road (-1 to 1 to stay independent of roadWidth)
let playerZ       = null;                    // player relative z distance from camera (computed)
let position      = 0;                       // current camera Z position (add playerZ to get player's absolute Z position)
let speed         = 0;                       // current speed

const COLORS = {
	TREE: 0x005108,
	FOG:  0x86a81f,
	LIGHT:  { road: 0x939393, grass: 0x9ec725, rumble: 0xFFFFFF, lane: 0xffffff  },
	DARK:   { road: 0x909090, grass: 0x98bf23, rumble: 0xbe2632                   },
	TUNNEL_LIGHT: { road: 0x737373, grass: 0x737373, rumble: 0xDDDDDD, lane: 0xDDDDDD  },
	TUNNEL_DARK:  { road: 0x707070, grass: 0x707070, rumble: 0x7d1820                   },
	START:  { road: 0xFFFFFF,   grass: 0xFFFFFF,   rumble: 0xFFFFFF                     },
	FINISH: { road: 0x000000,   grass: 0x000000,   rumble: 0x000000                     }
};

const ROAD = {
	LENGTH: { NONE: 0, SHORT:  25, MEDIUM:  50, LONG:  100 },
	HILL:   { NONE: 0, LOW:    20, MEDIUM:  40, HIGH:   60 },
	CURVE:  { NONE: 0, EASY:    2, MEDIUM:   4, HARD:    6 }
};

const LAYERS = {
	TRACK: 0,
	THINGS: 1,
	CAR: 2,
	UI: 3
};

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

		// init
		cameraDepth = 1 / Math.tan((fieldOfView/2) * Math.PI/180);
		playerZ = (cameraHeight * cameraDepth);

		this.bounceTimer = new FrameCounter(10);

		this.createTrack();

		this.initGFX();

		this.render();
	}

	/**
	 * Creates the PIXI rendering objects
	 */
	initGFX() {
		// Create Graphics entity
		let e = new Entity();
		this._gfx = new PIXI.Graphics();
		e.configSprite({
			replaceWith: this._gfx
		});
		e.layer = LAYERS.TRACK;
		this.add(e);

		// create a gradient as a texture for the sky
		let c = document.createElement("canvas");
		c.width = width * scale;
		c.width = height * scale;
		let ctx = c.getContext("2d");
		let gradient = ctx.createLinearGradient(0,0,width,height);
		gradient.addColorStop(0, "#010044");
		gradient.addColorStop(1, "#2d032c");
		ctx.fillStyle = gradient;
		ctx.fillRect(0, 0, width*2, height*2);
		this._skyTexture = new PIXI.Texture.from(c);

		// Sprites
		// Car
		this._carEntity = new Entity();
		// outside the view initially
		this._carEntity.x = -1000;
		this._carEntity.y = -1000;
		this._carEntity.configSprite({
			sheet: "car",
			animations: {
				default: "idle",
				idle: {
					frames: [0]
				},
				left: {
					frames: [4]
				},
				right: {
					frames: [8]
				}
			}
		});
		this._carEntity._pixiSprite.width *= 1.25;
		this._carEntity._pixiSprite.height *= 1.25;
		this._carEntity.layer = LAYERS.CAR;
		this.add(this._carEntity);

		// The sprite layer will initially z-sorts its entities.
		// This is a hack, because the JMP Engine doesn't normally account for the PIXI.js based z-sorting.
		// In the JMP Engine, the number of layers is typically limit as a design choice for each game individually.
		// The PIXI.js z-sorting only happens once initial, because the sprite's zIndex is not
		// modified afterwards. So no performance drawback.
		this._layers[LAYERS.THINGS].sortableChildren = true;

		// #UI Texts
		// Laps
		let lapsCount = new BitmapText({
			font: "font1",
			text: `Lap:1/3`,
			x: 2,
			y: height-10
		});
		lapsCount.layer = LAYERS.UI;
		this.add(lapsCount);

		let lapsTiming = new BitmapText({
			font: "vfr95_blue",
			text: `#0: ${this.timing.total}`,
			x: 2,
			y: 2
		});
		lapsTiming.layer = LAYERS.UI;
		this.add(lapsTiming);

		this._ui = {
			lapsCount,
			lapsTiming
		};
	}

	checkGameStart() {
		if (!this.started) {
			if (Keyboard.down(Keys.ENTER)) {
				// lower camera a bit
				cameraHeight = 350;
				this.render();
				this.started = true;
				this.timing.start = performance.now();
			}
		}
	}

	clearCheckpoint() {
		if (!this.finished) {
			// find player segment first
			let playerSegment = this.findSegment(position + playerZ);

			// We check if the player has crossed 3 specific segments on the halfway point of the track.
			// If so, we set a flag that the checkpoint was cleared and the next time the
			// player passes the first 3 segments of the track we consider the lap completed.
			// This checkpoint system prevents us from counting a lap multiple times when two update loops
			// happen while the player is on the goal segment.
			// This might happen if the player is driving slowly through the goal.
			let checkpointMark = Math.floor(segments.length/2);

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

	update() {
		this.checkGameStart();
		this.clearCheckpoint();

		if (!this.started || this.finished) {
			return;
		}

		this.trackTime();

		// limit dt to max frame time for stable updates
		dt = M4th.limit(dt, 0, timePerFrame);

		// find player segment first
		let playerSegment = this.findSegment(position + playerZ);
		let dx = dt / 1000;
		let speedPercent  = speed/maxSpeed;

		// check if we "animate" a bounce back onto the road
		if (this.bounce) {
			if (this.bounceTimer.isReady()) {
				speed = 0;
				this.bounce = false;
				this.bounceTimer.reset();
			}
			playerX = playerX - dx * 6 * this.bounceDir;
			position = M4th.increase(position, dt * speed, trackLength);
			this.render();
			return;
		}

		// check horizontal movement
		// we can always move horizontally since it makes for a more fun arcade game
		if (Keyboard.down(Keys.LEFT)) {
			playerX = playerX - dx;
			this.dir = "left";
		} else if (Keyboard.down(Keys.RIGHT)) {
			playerX = playerX + dx;
			this.dir = "right";
		} else {
			this.dir = "idle";
		}

		// Apply centrifugal force based on curve and the current speed:
		// If the player has no speed we of course don't apply any additional force
		playerX = playerX - (dx * speedPercent * playerSegment.curve * centrifugal);

		// handle acceleration and deceleration
		if (Keyboard.down(Keys.UP)) {
			speed = M4th.accelerate(speed, accel, dt);
		} else if ((Keyboard.down(Keys.DOWN) || Keyboard.down(Keys.SPACE))) {
			speed = M4th.accelerate(speed, breaking, dt);
			speed = M4th.limit(speed, 0, maxSpeed);
		} else {
			// no pedal pressed: decelerate slowly
			speed = M4th.accelerate(speed, decel, dt);
			speed = M4th.limit(speed, 0, maxSpeed);
		}

		// decelerate if the player is off the road
		if (((playerX < -1) || (playerX > 0.9)) && (speed > offRoadLimit)) {
			speed = M4th.accelerate(speed, -speed/500, dt);
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
						if (M4th.collides(playerX, playerW, collisionData.x, collisionData.w)) {
							// bounce back
							this.bounce = true;
							this.bounceDir = Math.sign(playerX);
							speed = decel;
							break;
						}
					}
				}
			}
		}

		// clamp speed
		speed = M4th.limit(speed, -maxSpeed/4, maxSpeed);

		// finally update the player position on the track
		position = M4th.increase(position, dt * speed, trackLength);

		this.render();
	}

	collides(x1, w1, x2, w2) {
		if (x1 < x2 + w2 &&
			x1 + w1 > x2) {
				return true;
		}
		return false;
	}

	createSpriteEntity(spec) {
		let e = new Entity();
		e.configSprite({
			sheet: spec.sheet,
			id: spec.id
		});
		e.visible = false;
		e.active = false;
		e.layer = LAYERS.THINGS;
		e._pixiSprite.zIndex = spec.zIndex;
		this.add(e);
		Object.assign(e, spec);
		return e;
	}

	addSegment(curve, y) {
		let n = segments.length;
		let zIndex = 1000 - n;
		let alternate = Math.floor(n/rumbleLength)%2;

		segments.push({
			index: n,
				p1: { world: {y: this.lastY(), z: n * segmentLength },     camera: {}, screen: {} },
				p2: { world: {y: y,            z: (n+1) * segmentLength }, camera: {}, screen: {} },
			curve: curve,
			color: alternate ? COLORS.DARK : COLORS.LIGHT,
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
					scale: PLAYER_SCALE * 2,
					collisionData: []
				});
				sprLeft.collisionData.push({
					x: -2,
					w: 1.2
				});
				segments[n].sprites.push(sprLeft);

				let sprRight = this.createSpriteEntity({
					sheet: "sprites",
					id: 2,
					zIndex: zIndex,
					offset: Helper.choose([1.25, 1.5, 1.75, 2]),
					w: 100,
					h: 100,
					scale: PLAYER_SCALE * 2,
					collisionData: []
				});
				sprRight.collisionData.push({
					x: 2,
					w: 1.2
				});
				segments[n].sprites.push(sprRight);
			}
		} else if ((n > 300 && n < 400) || (n > 500 && n < 700) || (n > 3700 && n < 4000)) {
			// three tunnels
			segments[n].color = alternate ? COLORS.TUNNEL_DARK : COLORS.TUNNEL_LIGHT;
			segments[n].sprites.push(this.createSpriteEntity({
				sheet: "tunnel",
				id: 0,
				zIndex: zIndex,
				offset: -1,
				// for collision we only care about the horizontal dimensions of the sprite...
				w: 200,
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
				sheet: "billboards",
				id: 0,
				zIndex: zIndex,
				offset: Helper.choose([-1.25, - 1.5, -1.75]),
				w: 100,
				h: 100,
				scale: PLAYER_SCALE*2,
				collisionData: []
			});
			let sprScaledWidth = sprLeft.w * sprLeft.scale;
			sprLeft.collisionData.push({
				x: sprLeft.offset + sprScaledWidth * Math.sign(sprLeft.offset),
				w: sprScaledWidth
			});
			segments[n].sprites.push(sprLeft);
		}  else if (n%350 == 0) {
			let sprRight = this.createSpriteEntity({
				sheet: "billboards",
				id: 0,
				zIndex: zIndex,
				offset: Helper.choose([1.25, 1.5, 1.75]),
				w: 100,
				h: 100,
				scale: PLAYER_SCALE * 2,
				collisionData: []
			});
			let sprScaledWidth = sprRight.w * sprRight.scale;
			sprRight.collisionData.push({
				x: sprRight.offset + sprScaledWidth * Math.sign(sprRight.offset),
				w: sprScaledWidth
			});
			segments[n].sprites.push(sprRight);
		} else {
			if (n%5 == 0) {
				let sprLeft = this.createSpriteEntity({
					sheet: "sprites",
					id: Helper.choose([0, 0, 0, 1]),
					zIndex: zIndex,
					offset: Helper.choose([-1.25, - 1.5, -1.75, -2, -2.5, -3, -4]),
					w: 100,
					h: 100,
					scale: Helper.choose([PLAYER_SCALE, 0.01, 0.008, 0.015]),
					collisionData: []
				});
				let sprScaledWidth = sprLeft.w * sprLeft.scale;
				sprLeft.collisionData.push({
					x: sprLeft.offset + sprScaledWidth * Math.sign(sprLeft.offset),
					w: sprScaledWidth
				});
				segments[n].sprites.push(sprLeft);

				let sprRight = this.createSpriteEntity({
					sheet: "sprites",
					id: Helper.choose([0, 0, 0, 1]),
					zIndex: zIndex,
					offset: Helper.choose([1.25, 1.5, 1.75, 2, 2.5, 3, 4]),
					w: 100,
					h: 100,
					scale: Helper.choose([PLAYER_SCALE, 0.01, 0.008, 0.015]),
					collisionData: []
				});
				sprScaledWidth = sprRight.w * sprRight.scale;
				sprRight.collisionData.push({
					x: sprRight.offset + sprScaledWidth * Math.sign(sprRight.offset),
					w: sprScaledWidth
				});
				segments[n].sprites.push(sprRight);
			}
		}
	}

	// retrieve the y value (road-height) of the last added road segment
	lastY() {
		return (segments.length == 0) ? 0 : segments[segments.length-1].p2.world.y;
	}

	firstY() {
		return segments.length == 0 ? 0 : segments[0].p2.world.y;
	}

	addRoad(enter, hold, leave, curve, y) {
		y = y || 0;
		let startY = this.lastY();
		let endY = startY + (y * segmentLength);
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

		// climp (forest?)
		this.addRoad(50, 50, 50,  0,  -40);			// 110
		this.addRoad(100, 50, 50,   2,  -50);		//  60

		this.addRoad(100, 100, 100, -2, +50);		// 110

		// chicane
		this.addRoad(100, 100, 50, -3.5, 25);		// 135
		this.addRoad(20,   20, 20,  0,    0);		// 135 ---
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

		segments[this.findSegment(playerZ).index + 2].color = COLORS.START;
		segments[this.findSegment(playerZ).index + 3].color = COLORS.START;
		for(var n = 0 ; n < rumbleLength ; n++) {
			segments[segments.length-1-n].color = COLORS.FINISH;
		}

		trackLength = segments.length * segmentLength;
	}

	addStraight(num) {
		num = num || ROAD.LENGTH.MEDIUM;
		this.addRoad(num, num, num, 0, 0);
	}

	addCurve(num, curve) {
		num    = num    || ROAD.LENGTH.MEDIUM;
		curve  = curve  || ROAD.CURVE.MEDIUM;
		let height = height || ROAD.HILL.NONE;
		this.addRoad(num, num, num, curve, height);
	}

	addHill(num, height) {
		num    = num    || ROAD.LENGTH.MEDIUM;
		height = height || ROAD.HILL.MEDIUM;
		this.addRoad(num, num, num, 0, height);
	}

	addSCurves() {
		this.addRoad(ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM,  -ROAD.CURVE.EASY,      ROAD.HILL.NONE);
		this.addRoad(ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM,   ROAD.CURVE.MEDIUM,    ROAD.HILL.MEDIUM);
		this.addRoad(ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM,   ROAD.CURVE.EASY,     -ROAD.HILL.LOW);
		this.addRoad(ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM,  -ROAD.CURVE.EASY,      ROAD.HILL.MEDIUM);
		this.addRoad(ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM,  -ROAD.CURVE.MEDIUM,   -ROAD.HILL.MEDIUM);
		this.addRoad(ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM,   ROAD.CURVE.NONE,     ROAD.HILL.LOW);
	}

	findSegment(z) {
		return segments[Math.floor(z/segmentLength) % segments.length];
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

	renderSegment(width, lanes, x1, y1, w1, x2, y2, w2, fog, color) {
		let lanew1, lanew2, lanex1, lanex2, lane;

		let r1 = this.calculateRumbleWidth(w1, lanes);      //basic: *0.8;  raw: /2;
		let r2 = this.calculateRumbleWidth(w2, lanes);      //basic: *0.8;  raw: /2;

		let l1 = this.calculateLaneMarkerWidth(w1, lanes)*2;  //basic: *2;  raw: *1
		let l2 = this.calculateLaneMarkerWidth(w2, lanes)*2;  //basic: *2;  raw: *1

		// for rendering grass we use a Basic Mode layer underneath the road
		// this optimizes the performance on higher resolutions
		this._gfx.beginFill(color.grass);
		this._gfx.drawRect(0, y2, width, y1 - y2);

		// basic
		this.polyf({x:x1-w1-r1, y:y1}, {x:x1-w1, y:y1}, {x:x2-w2, y:y2}, {x:x2-w2-r2, y:y2}, color.rumble);
		this.polyf({x:x1+w1+r1, y:y1}, {x:x1+w1, y:y1}, {x:x2+w2, y:y2}, {x:x2+w2+r2, y:y2}, color.rumble);
		this.polyf({x:x1-w1,    y:y1}, {x:x1+w1, y:y1}, {x:x2+w2, y:y2}, {x:x2-w2,    y:y2}, color.road);

		if (color.lane) {
			lanew1 = w1*2/lanes;
			lanew2 = w2*2/lanes;
			lanex1 = x1 - w1 + lanew1;
			lanex2 = x2 - w2 + lanew2;
			for(lane = 1 ; lane < lanes ; lanex1 += lanew1, lanex2 += lanew2, lane++) {
				this.polyf({x:lanex1 - l1/2, y:y1}, {x:lanex1 + l1/2, y:y1}, {x:lanex2 + l2/2, y:y2}, {x:lanex2 - l2/2, y:y2}, color.lane);
			}
		}

		// render some fog in the distance to mask artifacts, silent hill style :)
		if (fog < 1) {
			this._gfx.beginFill(COLORS.FOG, 1-fog);
			this._gfx.drawRect(0, y1, width, y2-y1);
		}
	}

	calculateRumbleWidth(projectedRoadWidth, lanes) {
		return projectedRoadWidth/Math.max(6,  2*lanes);
	}

	calculateLaneMarkerWidth(projectedRoadWidth, lanes) {
		return projectedRoadWidth/Math.max(32, 8*lanes);
	}

	render() {
		let baseSegment = this.findSegment(position);
		let basePercent = M4th.percentRemaining(position, segmentLength);

		var playerSegment = this.findSegment(position + playerZ);
		var playerPercent = M4th.percentRemaining(position + playerZ, segmentLength);
		var playerY       = M4th.interpolate(playerSegment.p1.world.y, playerSegment.p2.world.y, playerPercent)

		let maxy        = height;

		let x  = 0;
		let dx = -(baseSegment.curve * basePercent);

		// reset screen before drawing
		this._gfx.clear();

		// render Sky BG
		this._gfx.beginTextureFill({texture: this._skyTexture});
		this._gfx.drawRect(0, 0, width*scale, height*scale);

		for(let n = 0 ; n < drawDistance ; n++) {
			let segment    = segments[(baseSegment.index + n) % segments.length];
			segment.looped = segment.index < baseSegment.index;
			segment.fog    = M4th.exponentialFog((n/1.5)/drawDistance, fogDensity);
			segment.clip = maxy;

			M4th.project(segment.p1, (playerX * roadWidth) - x,      playerY + cameraHeight, position - (segment.looped ? trackLength : 0), cameraDepth, width, height, roadWidth);
			M4th.project(segment.p2, (playerX * roadWidth) - x - dx, playerY + cameraHeight, position - (segment.looped ? trackLength : 0), cameraDepth, width, height, roadWidth);

			x  = x + dx;
			dx = dx + segment.curve;

			if ((segment.p1.camera.z <= cameraDepth) || // behind us
				(segment.p2.screen.y >= segment.p1.screen.y) || // back face cull
				(segment.p2.screen.y >= maxy)) {        // clip by (already rendered) segment
				continue;
			}

			this.renderSegment(width, lanes,
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
		for(let n = 0; n < ((drawDistance*0.8)-1); n++) {
			let segment = segments[(baseSegment.index + n) % segments.length];

			for(let i = 0 ; i < segment.sprites.length ; i++) {

				let sprite      = segment.sprites[i];
				let spriteWidth = sprite.w;
				let spriteHeight = sprite.h;
				let spriteScale = segment.p1.screen.scale;
				let spriteX;
				if (sprite.sheet == "tunnel") {
					spriteX = segment.p1.screen.x - (spriteScale * sprite.offset * roadWidth * width);
				} else {
					spriteX     = segment.p1.screen.x + (spriteScale * sprite.offset * roadWidth * width/2);
				}

				let spriteY     = segment.p1.screen.y;


				let destW  = Math.floor((spriteWidth * spriteScale * width) * (sprite.scale * roadWidth));
				let destH  = Math.floor((spriteHeight * spriteScale * width) * (sprite.scale * roadWidth));

				let clipY = segment.clip;

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
					//GFX.get(Layers.Things).spr_ext(sprite.sheet, sprite.id, 0, 0, spriteWidth, spriteHeight - (spriteHeight*clipH/destH), destX, destY, destW, destH - clipH);
				} else {
					if (sprite instanceof Entity) {
						sprite.visible = false;
					}
				}
			}

			if (segment == playerSegment) {
				let carW = 86 * 1.25;
				let carH = 26 * 1.25;
				let carDir = "idle";
				if ((segment.curve > 1 || segment.curve < 0) && this.dir != "idle") {
					carDir = this.dir;
				}
				this._carEntity.playAnimation({name: carDir});
				this._carEntity.x = width/2 - carW/2;
				this._carEntity.y = height - carH - 30 - Helper.choose([0,1]);
			}
		}

		/********** #UI ***********/

		// laps
		let laps = this.timing.laptimes.length + 1;
		this._ui.lapsCount.setText(`Lap:${laps}/3`);

		// timing
		let lapTimingString = `#${laps}: ${this.timing.total}`;

		for (let i = 0; i < this.timing.laptimes.length; i++) {
			//_gfx.alpha(1/(i+2));
			let timing = this.timing.laptimes[i];
			lapTimingString += `\n#${timing.lap}: ${timing.time}`;
		}
		this._ui.lapsTiming.setText(lapTimingString);

		// // tacho and speed number
		// let speedPercent  = Math.max(0, speed/maxSpeed);
		// let tachoXoffset = width - 28;
		// // The countach has a max speed of 333km/h :O, though our car accelerates a bit faster than 100km/h in 3.6s
		// let kmhStr = `${Math.ceil(333*speedPercent)}`.padStart(3, "0");

		// _gfx.text("font1", width - 34, height - 10, "km/h");

		// // fill tacho
		// let fill = Math.ceil(speedPercent * 60);
		// let tachoHeight = height - fill;
		// _gfx.text("font1", tachoXoffset-1, tachoHeight - 22, kmhStr);
		// _gfx.alpha(0.7);
		// _gfx.spr_ext("tacho", 0, 0, 60 - fill, undefined, undefined, tachoXoffset, tachoHeight - 12);
		// _gfx.alpha(1);

		// // intro
		// if (!this.started) {
		// 	_gfx.rectf(0, height/2 - 10, width, 10, "#000000");
		// 	_gfx.text("font1", 20, height/2 - 9, "Press ENTER to start!");
		// }
	}
}

export default RaceTrack;