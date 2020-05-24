import Manifest from "../../../src/Manifest.js";
import Screen from "../../../src/game/Screen.js";
import GFX from "../../../src/gfx/GFX.js";
import Buffer from "../../../src/gfx/Buffer.js";
import Text from "../../../src/gfx/Text.js";
import Engine from "../../../src/Engine.js";
import Keyboard from "../../../src/input/Keyboard.js";
import Keys from "../../../src/input/Keys.js";

import M4th from "./M4th.js";
import Helper from "../../../src/utils/Helper.js";

let width = Manifest.get("/w");
let height = Manifest.get("/h");
let timePerFrame = Engine.getTimePerFrame();

let segments = [];
let roadWidth     = 700;                    // actually half the roads width, easier math if the road spans from -roadWidth to +roadWidth
let segmentLength = 100;                     // length of a single segment
let rumbleLength  = 4;                       // number of segments per red/white rumble strip
let trackLength   = null;                    // z length of entire track (computed)
let lanes         = 2;                       // number of lanes
let fieldOfView   = 100;                     // angle (degrees) for field of view
let cameraHeight  = 700;                    // z height of camera
let cameraDepth   = null;                    // z distance camera is from screen (computed)
let drawDistance  = 300;                     // number of segments to draw
let playerX       = 0;                       // player x offset from center of road (-1 to 1 to stay independent of roadWidth)
let playerZ       = null;                    // player relative z distance from camera (computed)
let fogDensity    = 5;                       // exponential fog density
let position      = 0;                       // current camera Z position (add playerZ to get player's absolute Z position)
let speed         = 0;                       // current speed
let maxSpeed      = (segmentLength * 1.5)/Engine.getTimePerFrame();      // top speed (ensure we can't move more than 1 segment in a single frame to make collision detection easier)
let centrifugal   = 0.50;
let accel         =  maxSpeed/5;             // acceleration rate - tuned until it 'felt' right
let breaking      = -maxSpeed;               // deceleration rate when braking
let decel         = -maxSpeed/8;             // 'natural' deceleration rate when neither accelerating, nor braking
let offRoadLimit  =  maxSpeed/8;

const PLAYER_SCALE = 0.3 * (1/43);
const playerW = 43 * PLAYER_SCALE;

const COLORS = {
	SKY:  'linear-gradient(rgb(255, 188, 0), rgb(255, 255, 255))',
	TREE: '#005108',
	FOG:  '#86a81f',
	LIGHT:  { road: '#939393', grass: '#9ec725', rumble: '#FFFFFF', lane: '#ffffff'  },
	DARK:   { road: '#909090', grass: '#98bf23', rumble: '#be2632'                   },
	START:  { road: 'white',   grass: 'white',   rumble: 'white'                     },
	FINISH: { road: 'black',   grass: 'black',   rumble: 'black'                     }
};

const ROAD = {
	LENGTH: { NONE: 0, SHORT:  25, MEDIUM:  50, LONG:  100 },
	HILL:   { NONE: 0, LOW:    20, MEDIUM:  40, HIGH:   60 },
	CURVE:  { NONE: 0, EASY:    2, MEDIUM:   4, HARD:    6 }
};

/**
 * Layers:
 * 0: Background
 * 1: Road
 * 2: Car
 * 3: UI
 */

const Layers = {
	BG: 0,
	Grass: 1,
	Road: 2,
	Fog: 3,
	Things: 4,
	Car: 5,
	UI: 6
};

 class RaceTrack extends Screen {
	constructor() {
		super();

		// time tracking
		this.timing = {
			laps: 1,
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

		this.resetRoad();
	}

	setup() {
		GFX.getBuffer(Layers.BG).setClearColor(COLORS.SKY);
		GFX.getBuffer(Layers.Road).setRenderMode(Buffer.RenderModes.RAW);
	}

	checkGameStart() {
		if (!this.started) {
			if (Keyboard.down(Keys.ENTER)) {
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
				this.timing.laps++;
				this.checkpointCleared = false;
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

	update(dt) {

		this.checkGameStart();
		this.clearCheckpoint();

		if (!this.started || this.finished) {
			return;
		}

		this.trackTime();

		// find player segment first
		let playerSegment = this.findSegment(position + playerZ);

		let speedPercent  = speed/maxSpeed;
		let dx = dt * 1.5;

		// limit dt to max frame time for stable updates
		dt = M4th.limit(dt, 0, timePerFrame);

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
		} else if (Keyboard.down(Keys.DOWN) || Keyboard.down(Keys.SPACE)) {
			speed = M4th.accelerate(speed, breaking, dt);
			speed = M4th.limit(speed, 0, maxSpeed);
		} else {
			// no pedal pressed: decelerate slowly
			speed = M4th.accelerate(speed, decel, dt);
			speed = M4th.limit(speed, 0, maxSpeed);
		}

		for(let n = 0 ; n < playerSegment.sprites.length ; n++) {
			let sprite  = playerSegment.sprites[n];

			if (sprite.collidable) {
				let sprW = sprite.w * sprite.scale;

				if (M4th.collides(playerX, playerW, sprite.offset + sprW * (sprite.offset > 0 ? 1 : -1), sprW)) {
					// bounce back
					speed = -maxSpeed/4;
					break;
				}
			}
		}

		// decelerate if the player is off the road
		if (((playerX < -0.9) || (playerX > 0.9)) && (speed > offRoadLimit)) {
			speed = M4th.accelerate(speed, -speed, dt);
		}

		// clamp speed
		speed = M4th.limit(speed, -maxSpeed/5, maxSpeed);

		// finally update the player position on the track
		position = M4th.increase(position, dt * speed, trackLength);
	}

	collides(x1, w1, x2, w2) {
		if (x1 < x2 + w2 &&
			x1 + w1 > x2) {
				return true;
		}
		return false;
	}

	addSegment(curve, y) {
		let n = segments.length;
		segments.push({
			index: n,
				p1: { world: {y: this.lastY(), z: n * segmentLength },     camera: {}, screen: {} },
				p2: { world: {y: y,            z: (n+1) * segmentLength }, camera: {}, screen: {} },
			curve: curve,
			color: Math.floor(n/rumbleLength)%2 ? COLORS.DARK : COLORS.LIGHT,
			sprites: [],
			looped: false,
			laps: 0,
		});

		if (n%2 == 0) {
			segments[n].sprites.push({
				sheet: "trees",
				offset: Helper.choose([-1.25, - 1.5, -1.75, -2, -2.5, -3, -4]),
				// for collision we only care about the horizontal dimensions of the sprite...
				w: 100,
				// ... for depth scaling however we also need the height
				h: 100,
				scale: Helper.choose([PLAYER_SCALE, 0.01, 0.008, 0.015]),
				collidable: true
			});
			segments[n].sprites.push({
				sheet: "trees",
				offset: Helper.choose([1.25, 1.5, 1.75, 2, 2.5, 3, 4]),
				w: 100,
				h: 100,
				scale: Helper.choose([PLAYER_SCALE, 0.01, 0.008, 0.015]),
				collidable: true
			});
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

	resetRoad() {
		segments = [];

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
		height = height || ROAD.HILL.NONE;
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

	renderSegment(g, width, lanes, x1, y1, w1, x2, y2, w2, fog, color) {
		let lanew1, lanew2, lanex1, lanex2, lane;

		let r1 = this.calculateRumbleWidth(w1, lanes)/2;      //basic: *0.8;  raw: /2;
		let r2 = this.calculateRumbleWidth(w2, lanes)/2;      //basic: *0.8;  raw: /2;

		let l1 = this.calculateLaneMarkerWidth(w1, lanes)*1;  //basic: *2;  raw: *1
		let l2 = this.calculateLaneMarkerWidth(w2, lanes)*1;  //basic: *2;  raw: *1

		// for rendering grass we use a Basic Mode layer underneath the road
		// this optimizes the performance on higher resolutions
		GFX.get(Layers.Grass).rectf(0, y2, width, y1 - y2, color.grass);

		// raw
		g.polyf(x1-w1,       y1, w1*2,    x2-w2,       y2, w2*2, color.road);
		g.polyf(x1-w1-r1+1,  y1, r1,      x2-w2-r2+1,  y2, r2, color.rumble); // left
		g.polyf(x1+w1-1,     y1, r1+1,    x2+w2-1,     y2, r2+1, color.rumble); // right

		// basic
		// g.polyf([{x:x1-w1-r1+1, y:y1}, {x:x1-w1+1, y:y1}, {x:x2-w2+1, y:y2}, {x:x2-w2-r2+1, y:y2}], 0, 0, color.rumble);
		// g.polyf([{x:x1+w1+r1-1, y:y1}, {x:x1+w1-1, y:y1}, {x:x2+w2-1, y:y2}, {x:x2+w2+r2-1, y:y2}], 0, 0, color.rumble);
		// g.polyf([{x:x1-w1,    y:y1}, {x:x1+w1, y:y1}, {x:x2+w2, y:y2}, {x:x2-w2,    y:y2}], 0, 0, color.road);

		if (color.lane) {
			lanew1 = w1*2/lanes;
			lanew2 = w2*2/lanes;
			lanex1 = x1 - w1 + lanew1;
			lanex2 = x2 - w2 + lanew2;
			for(lane = 1 ; lane < lanes ; lanex1 += lanew1, lanex2 += lanew2, lane++) {
				// g.polyf([{x:lanex1 - l1/2, y:y1}, {x:lanex1 + l1/2, y:y1}, {x:lanex2 + l2/2, y:y2}, {x:lanex2 - l2/2, y:y2}], 0, 0, color.lane);
				g.polyf(lanex1-l1/2, y1, l1*2,  lanex2+l2/2, y2, Math.ceil(l2*2),  color.lane);
			}
		}

		if (fog < 1) {
			let g = GFX.get(Layers.Fog);
			let oldAlpha = g.alpha();
			g.alpha(1-fog)
			g.rectf(0, y1, width, y2-y1, COLORS.FOG);
			g.alpha(oldAlpha);
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

		let g = GFX.get(Layers.Road);

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

			this.renderSegment(g, width, lanes,
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
		for(let n = ((drawDistance*0.8)-1) ; n > 0 ; n--) {
			let segment = segments[(baseSegment.index + n) % segments.length];

			for(let i = 0 ; i < segment.sprites.length ; i++) {

				let sprite      = segment.sprites[i];
				let spriteWidth = sprite.w;
				let spriteHeight = sprite.h;
				let spriteScale = segment.p1.screen.scale;
				let spriteX     = segment.p1.screen.x + (spriteScale * sprite.offset * roadWidth * width/2);
				let spriteY     = segment.p1.screen.y;

				let destW  = (spriteWidth * spriteScale * width) * (sprite.scale * roadWidth);
				let destH  = (spriteHeight * spriteScale * width) * (sprite.scale * roadWidth);

				let clipY = segment.clip;

				let offsetX = (sprite.offset < 0 ? -1 : 0);
				let offsetY = -1
				let destX = spriteX + (destW * (offsetX || 0));
				let destY = spriteY + (destH * (offsetY || 0));

				var clipH = clipY ? Math.max(0, destY+destH-clipY) : 0;
				if (clipH < destH) {
					GFX.get(Layers.Things).spr_ext(sprite.sheet, 0, 0, 0, spriteWidth, spriteHeight - (spriteHeight*clipH/destH), destX, destY, destW, destH - clipH);
				}
			}

			// render player in between sprites
			if (segment == playerSegment) {
				let carW = 43;
				let carH = 23;
				let carID = 0;
				if (this.dir == "left") {
					carID = 4;
				} else if (this.dir == "right") {
					carID = 8;
				}
				GFX.get(Layers.Things).spr("car", carID, width/2 - carW/2, height - carH - 5);
			}
		}

		/*********+ UI ***********/

		let _gfx = GFX.get(Layers.UI);

		// laps
		_gfx.text("vfr95_outline", 2, height-10, `Lap:${this.timing.laps}/3`);

		// timing
		_gfx.text("vfr95_outline", 2, 2, `#1: ${this.timing.total}`);
		// _gfx.alpha(0.4);
		// _gfx.text("vfr95_outline", 2, 12, `#2: ${this.timing.total}`);
		// _gfx.text("vfr95_outline", 2, 22, `#3: ${this.timing.total}`);
		// _gfx.alpha(1);

		// tacho and speed number
		let speedPercent  = Math.max(0, speed/maxSpeed);
		let tachoXoffset = width - 28;
		// The countach has a max speed of 333km/h :O, though our car accelerates a bit faster than 100km/h in 3.6s
		let kmhStr = `${Math.ceil(333*speedPercent)}`.padStart(3, "0");

		_gfx.text("vfr95_outline", width - 34, height - 10, "km/h");

		// fill tacho
		let fill = Math.ceil(speedPercent * 60);
		let tachoHeight = height - fill;
		_gfx.text("vfr95_outline", tachoXoffset-1, tachoHeight - 22, kmhStr);
		_gfx.alpha(0.7);
		_gfx.spr_ext("tacho", 0, 0, 60 - fill, undefined, undefined, tachoXoffset, tachoHeight - 12);
		_gfx.alpha(1);

		// intro
		if (!this.started) {
			_gfx.rectf(0, height/2 - 10, width, 10, "#000000");
			_gfx.text("vfr95_outline", 20, height/2 - 9, "Press ENTER to start!");
		}
	}
}

export default RaceTrack;