import Manifest from "../../../src/Manifest.js";
import Screen from "../../../src/game/Screen.js";
import GFX from "../../../src/gfx/GFX.js";
import Buffer from "../../../src/gfx/Buffer.js";
import Text from "../../../src/gfx/Text.js";
import Engine from "../../../src/Engine.js";
import Keyboard from "../../../src/input/Keyboard.js";
import Keys from "../../../src/input/Keys.js";

import M4th from "./M4th.js";

let width = Manifest.get("/w");
let height = Manifest.get("/h");
let timePerFrame = Engine.getTimePerFrame();

let segments = [];
var resolution    = null;                    // scaling factor to provide resolution independence (computed)
let roadWidth     = 2000;                    // actually half the roads width, easier math if the road spans from -roadWidth to +roadWidth
let segmentLength = 200;                     // length of a single segment
let rumbleLength  = 3;                       // number of segments per red/white rumble strip
let trackLength   = null;                    // z length of entire track (computed)
let lanes         = 3;                       // number of lanes
let fieldOfView   = 100;                     // angle (degrees) for field of view
let cameraHeight  = 1000;                    // z height of camera
let cameraDepth   = null;                    // z distance camera is from screen (computed)
let drawDistance  = 300;                     // number of segments to draw
let playerX       = 0;                       // player x offset from center of road (-1 to 1 to stay independent of roadWidth)
let playerZ       = null;                    // player relative z distance from camera (computed)
let fogDensity    = 5;                       // exponential fog density
let position      = 0;                       // current camera Z position (add playerZ to get player's absolute Z position)
let speed         = 0;                       // current speed
let maxSpeed      = segmentLength/Engine.getTimePerFrame();      // top speed (ensure we can't move more than 1 segment in a single frame to make collision detection easier)
let accel         =  maxSpeed/5;             // acceleration rate - tuned until it 'felt' right
let breaking      = -maxSpeed;               // deceleration rate when braking
let decel         = -maxSpeed/5;             // 'natural' deceleration rate when neither accelerating, nor braking
let offRoadDecel  = -maxSpeed/2;             // off road deceleration is somewhere in between
let offRoadLimit  =  maxSpeed/4;

const COLORS = {
	SKY:  '#eed372',
	TREE: '#005108',
	FOG:  '#86a81f',
	LIGHT:  { road: '#929292', grass: '#9ec725', rumble: '#fffacb', lane: '#fffacb'  },
	DARK:   { road: '#8d8d8d', grass: '#98bf23', rumble: '#c4595f'                   },
	START:  { road: 'white',   grass: 'white',   rumble: 'white'                     },
	FINISH: { road: 'black',   grass: 'black',   rumble: 'black'                     }
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
	Things: 3,
	Fog: 4,
	Car: 5,
	UI: 6
};

 class RaceTrack extends Screen {
	constructor() {
		super();

		let t = new Text({
			text: `Racer Demo`,
			x: 0,
			y: 1,
			color: "#FFFFFF",
			useKerning: true
		});
		t.layer = Layers.UI;
		this.add(t);

		// init
		cameraDepth = 1 / Math.tan((fieldOfView/2) * Math.PI/180);
		playerZ = (cameraHeight * cameraDepth);
		//resolution = height/480;

		this.resetRoad(); // only rebuild road when necessary
	}

	setup() {
		GFX.getBuffer(Layers.BG).setClearColor(COLORS.SKY);
		GFX.getBuffer(Layers.Road).setRenderMode(Buffer.RenderModes.RAW);
	}

	update(dt) {
		dt = M4th.limit(dt, 0, timePerFrame);
		position = M4th.increase(position, dt * speed, trackLength);

		var dx = dt * 2 * (speed/maxSpeed); // at top speed, should be able to cross from left to right (-1 to 1) in 1 second

		if (Keyboard.down(Keys.LEFT)) {
			playerX = playerX - dx;
		} else if (Keyboard.down(Keys.RIGHT)) {
			playerX = playerX + dx;
		}

		if (Keyboard.down(Keys.UP)) {
			speed = M4th.accelerate(speed, accel, dt);
		} else if (Keyboard.down(Keys.DOWN)) {
			speed = M4th.accelerate(speed, breaking, dt);
		} else {
			speed = M4th.accelerate(speed, decel, dt);
			speed = M4th.limit(speed, 0, maxSpeed); // or exceed maxSpeed
		}

		if (((playerX < -1) || (playerX > 1)) && (speed > offRoadLimit)) {
			speed = M4th.accelerate(speed, offRoadDecel, dt);
		}

		playerX = M4th.limit(playerX, -2, 2);     // dont ever let player go too far out of bounds
		speed   = M4th.limit(speed, -maxSpeed/4, maxSpeed); // or exceed maxSpeed
	}

	resetRoad() {
		segments = [];
		for(let n = 0 ; n < 500 ; n++) { // arbitrary road length
			segments.push({
				index: n,
				p1: {
					world: {
						z:  n * segmentLength
					},
					camera: {},
					screen: {}
				},
				p2: {
					world: {
						z: (n+1)*segmentLength
					},
					camera: {},
					screen: {}
				},
				color: Math.floor(n/rumbleLength)%2 ? COLORS.DARK : COLORS.LIGHT
			});
		}

		trackLength = segments.length * segmentLength;

		segments[this.findSegment(playerZ).index + 2].color = COLORS.START;
		segments[this.findSegment(playerZ).index + 3].color = COLORS.START;
		for(let n = 0 ; n < rumbleLength ; n++) {
			segments[segments.length-1-n].color = COLORS.FINISH;
		}

		trackLength = segments.length * segmentLength;
	}

	findSegment(z) {
		return segments[Math.floor(z/segmentLength) % segments.length];
	}

	renderSegment(g, width, lanes, x1, y1, w1, x2, y2, w2, fog, color) {
		let lanew1, lanew2, lanex1, lanex2, lane;

		let r1 = this.calculateRumbleWidth(w1, lanes) / 2;
		let r2 = this.calculateRumbleWidth(w2, lanes) / 2;

		let l1 = this.calculateLaneMarkerWidth(w1, lanes)/2;
		let l2 = this.calculateLaneMarkerWidth(w2, lanes)/2;

		// for rendering grass we use a Basic Mode layer underneath the road
		// this optimizes the performance on higher resolutions
		GFX.get(Layers.Grass).rectf(0, y2, width, y1 - y2, color.grass);

		g.polyf(x1-w1,       y1, w1*2,  x2-w2,       y2, w2*2, color.road);
		g.polyf(x1-w1-r1+1,  y1, r1,    x2-w2-r2+1,  y2, r2, color.rumble); // left
		g.polyf(x1+w1-1,     y1, r1,    x2+w2-1,     y2, r2, color.rumble); // right

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
				//g.polyf([{x:lanex1 - l1/2, y:y1}, {x:lanex1 + l1/2, y:y1}, {x:lanex2 + l2/2, y:y2}, {x:lanex2 - l2/2, y:y2}], 0, 0, color.lane);
				g.polyf(lanex1-l1/2, y1, l1*2,  lanex2+l2/2, y2, l2*2,  color.lane);
			}
		}

		//Render.fog(ctx, 0, y1, width, y2-y1, fog);
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
		// bg for text
		GFX.get(Layers.UI).rectf(0, 0, width, 10, "#000000");

		let baseSegment = this.findSegment(position);
		let maxy        = height;
		let g = GFX.get(Layers.Road);

		for(let n = 0 ; n < drawDistance ; n++) {
			let segment = segments[(baseSegment.index + n) % segments.length];
			segment.looped = segment.index < baseSegment.index;
			segment.fog    = M4th.exponentialFog(n/drawDistance, fogDensity);

			M4th.project(segment.p1, (playerX * roadWidth), cameraHeight, position - (segment.looped ? trackLength : 0), cameraDepth, width, height, roadWidth);
			M4th.project(segment.p2, (playerX * roadWidth), cameraHeight, position - (segment.looped ? trackLength : 0), cameraDepth, width, height, roadWidth);

			if ((segment.p1.camera.z <= cameraDepth) || // behind us
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

		let carW = 46;
		let carH = 25;

		GFX.get(Layers.Car).spr_ext("touringcar_orange", 4, width/2 - carW/2, height - carH - 10, carW, carH);

		/*Render.player(g, width, height, resolution, roadWidth, sprites, speed/maxSpeed,
			cameraDepth/playerZ,
			width/2,
			height,
			speed * (keyLeft ? -1 : keyRight ? 1 : 0),
			0
		);*/
	}
}

export default RaceTrack;