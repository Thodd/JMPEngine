import PIXI from "../../../../src/core/PIXIWrapper.js";
import Entity from "../../../../src/game/Entity.js";
import FrameCounter from "../../../../src/utils/FrameCounter.js";
import RNG from "../../../../src/utils/RNG.js";

// particle pool
const particlePool = [];
function get() {
	let p = particlePool.pop();
	if (p) {
		return p;
	} else {
		return {};
	}
}
function release(p) {
	p.released = true;
	particlePool.push(p);
}

class ParticleEmitter extends Entity {
	constructor() {
		super();

		// renderplane for primitives
		this._gfx = new PIXI.Graphics();
		this.configSprite({
			replaceWith: this._gfx
		});

		this._emissions = [];
	}

	emit(spec) {
		// map emission info
		let emi = Object.assign({
			// base values (public)
			x: 0,
			y: 0,
			amount: 10,
			maxAge: 7,
			maxRadius: 7,
			maxSpeed: 3,
			gravity: 0,
			colors: [0xFFFFFF],
			onEnd: null,

			// internals (private)
			particles: [],
			ended: false
		}, spec);

		// create a framecounter if needed
		if (emi.delay) {
			emi.delay = {
				frames: 0,
				maxFrames: emi.delay
			};
		}

		// spawn particles
		while (emi.amount > 0) {
			emi.amount--;

			let p = get();
			p.released = false; // particle is retrieved & alive again
			p.x = emi.x;
			p.y = emi.y;
			p.age = emi.maxAge;
			p.color = emi.colors[0];
			p.speed = RNG.randomInteger(1, emi.maxSpeed);
			p.dx = RNG.randomInteger(-1, 1) * p.speed;
			p.dy = RNG.randomInteger(-1, 1) * p.speed;

			emi.particles.push(p);
		}

		this._emissions.push(emi);
	}

	update() {
		this._gfx.clear();

		this._emissions = this._emissions.filter(function(e) { return !e.ended; });
		this._emissions.forEach((emi) => {
			this.processEmission(emi);
		});
	}

	processEmission(emi) {

		// skip frames until the configured delay is reached
		let updateParticles = true;
		if (emi.delay) {
			emi.delay.frames++;
			if (emi.delay.frames <= emi.delay.maxFrames) {
				updateParticles = false;
			} else {
				emi.delay.frames = 0;
			}
		}

		// the allDead depends on the update-cycle of the particles
		// we only need to check for dead particles if they are updated anyway
		let allDead = updateParticles;

		for (let p of emi.particles) {
			// update only living particles
			if (updateParticles) {
				if (p.age > 0) {
					p.x += p.dx;
					p.y += p.dy;
					p.age--;
					allDead = false;

					// apply gravity if set, default is 0
					p.dy += emi.gravity;
				} else if (!p.released) {
					release(p);
				}
			}

			let lifePercent = p.age/emi.maxAge;

			// cycle through the color list based on the age to maxage percentage
			let colorIndex = Math.floor((1 - lifePercent) * emi.colors.length);

			// circle radius
			let r = lifePercent * emi.maxRadius;

			this._gfx.beginFill(emi.colors[colorIndex]);
			this._gfx.drawCircle(p.x, p.y, r);
			this._gfx.endFill();
		}

		// end the emission if all particles are dead,
		// call optional onEnd callback
		emi.ended = allDead;
		if (emi.ended && emi.onEnd) {
			emi.onEnd();
		}
	}
}

export default ParticleEmitter;