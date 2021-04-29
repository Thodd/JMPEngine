import PIXI from "../../../src/core/PIXIWrapper.js";
import Entity from "../../../src/game/Entity.js";
import Screen from "../../../src/game/Screen.js";

class Main extends Screen {
	constructor() {
		super();

		this.z = 0; // in px
		this.segments = [];
		this.segmentLengthInPx = 100;
		this.segmentsCount = 200;
		this.totalTrackLength = this.segmentsCount * this.segmentLengthInPx;

		for (let s = 0; s < this.segmentsCount; s++) {
			this.segments[s] = {
				index: s,
				color: 0xFF0085,
				z: s * this.segmentLengthInPx,
				curve:
			};
		}

		this._step = 0;
		this._maxDistance = Math.log(30 * 100);

		// render entity
		let gfxEntity = new Entity();
		this.gfx = new PIXI.Graphics();
		gfxEntity.configSprite({
			replaceWith: this.gfx
		});
		this.add(gfxEntity);
	}

	// get the segment closest to the current Z value (in px)
	getClosestSegment(z) {
		return this.segments[Math.floor(z / this.segmentLengthInPx) + 1];
	}

	easeIn(a,b,percent) {
		return a + (b-a)*Math.pow(percent,2);
	}

	easeOut(a,b,percent) {
		return a + (b-a)*(1-Math.pow(1-percent,2));
	}

	easeInOut(a,b,percent) {
		return a + (b-a)*((-Math.cos(percent*Math.PI)/2) + 0.5);
	}

	update() {
		if (this.z >= this.totalTrackLength) {
			return;
		}

		this.gfx.clear();

		this._step += 0.01;
		let wave = Math.sin(this._step);
		this.z+=2;
		let startSegment = this.getClosestSegment(this.z).index;
		for (let i = 0; i < 30; i++) {
			let segment = this.segments[Math.min(startSegment + i, this.segmentsCount-1)];
			let zdiff = segment.z - this.z;

			this.gfx.lineStyle(1, this.segments[i].color);
			let distancePercent = Math.log(zdiff)/this._maxDistance;
			let offset = distancePercent * 216;
			let off = offset - 10 * i * wave;
			this.gfx.drawRect(100 + off, 0 + off, 432 - offset * 2, 432 - offset * 2);
		}
	}
}

export default Main;







/*
 const app = new PIXI.Application({
  width: 800, height: 600, backgroundColor: 0x000000, resolution: window.devicePixelRatio || 1,
});
document.body.appendChild(app.view);

const container = new PIXI.Container();

app.stage.addChild(container);

let gfx = new PIXI.Graphics();
container.addChild(gfx);

//let b = true;
//for (let i = 20; i > 0; i--) {
//  	b = !b;
//	gfx.beginFill(b ? 0x2c333d : 0x272e37);
//	gfx.drawCircle(400+i*5, 300+i*5, Math.pow(i, 2));
//  gfx.endFill();
//}

// Listen for animate update
let z = 0;
let segments = 200;
let step = 0;
app.ticker.add((dx) => {
z++;
step += 0.01;
let wave = Math.sin(step);

gfx.clear();
for (let i = 0; i < 30; i++) {
gfx.lineStyle(2, 0xFF0085);
    offset = 80 * Math.log(i);

  // why is this check needed?
 if(500-offset*2 > 0) {
        gfx.drawRect(150 + offset - 10 * i * wave, 50 + offset, 500-offset*2, 500-offset*2);
   }
}
});
*/