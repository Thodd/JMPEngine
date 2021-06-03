import Spritesheets from "../assets/Spritesheets.js";
import PIXI from "../core/PIXIWrapper.js";
import Entity from "./Entity.js";
import RNG from "../utils/RNG.js";

/**
 * Pool for all Particle Sprite instances.
 */
class ParticlePool {
	constructor(pixiContainer) {
		this._pool = [];
		this._pixiContainer = pixiContainer;
	}
	get() {
		let p = this._pool.pop();
		if (!p) {
			p = new PIXI.Sprite();
			p.anchor.set(0.5, 0.5);
			this._pixiContainer.addChild(p);
		}
		// show sprite before it leaves the pool
		p.visible = true;
		return p;
	}
	release(p) {
		this._pool.push(p);
		p.released = true;
		// hide sprite upon release
		// better to keep all sprites in the container instead of manipulating even more arrays each frame
		p.visible = false;
	}
}

/**
 * ParticleEmitter class.
 * Call emit(...) to emit a bunch of particles.
 * Each ParticleEmitter instance pools it's own particles and re-emits them if needed.
 * @public
 */
class ParticleEmitter extends Entity {
	constructor(spec) {
		super();

		// map emission info
		this.spec = Object.assign({
			// base values (public)
			x: 0,
			y: 0,

			// the amount of particles spawned with each emit() call
			amount: 10,

			// lifetime of a particle
			maxAge: 7,

			// starting radius of a particle
			maxRadius: 7,

			// speed
			minSpeed: 1,
			maxSpeed: 3,

			// angle in degree, if undefined, we explode in all directions
			angle: undefined,

			// deviation from the starting angle in pixels, added randomly to a particle (+ and -)
			deviation: 1,

			// gravity, constantly applied to a particle, for simplicity we don't accelerate
			gravity: 0,

			// the list of colors which will be cycled depending on the passed lifetime of a particle
			colors: [0xFFFFFF]
		}, spec);
		this.spec.colorCount = this.spec.colors.length;

		this.spec.sheet = Spritesheets.getSheet(this.spec.sheet);

		// container for particles sprites
		this._particleContainer = new PIXI.Container();
		this.configSprite({
			replaceWith: this._particleContainer
		});

		// particle pool instance, used by each emission to get a particle
		this._particlePool = new ParticlePool(this._particleContainer);

		// all active emissions
		this._emissions = [];
	}

	emit(spec) {

		let emi = {
			x: spec.x,
			y: spec.y,
			particles: [],
			ended: false,
		};

		// define the delay counter for this emission
		if (this.spec.delay) {
			emi.delay = {
				frames: 0,
				maxFrames: this.spec.delay
			};
		}

		// spawn particles
		let i = this.spec.amount;
		while (i > 0) {
			i--;

			let p = this._particlePool.get(this._particleContainer);

			// set texture
			p.texture = this.spec.sheet.textures[0];

			p.released = false; // particle is retrieved & alive again
			p.x = emi.x;
			p.y = emi.y;
			p.age = this.spec.maxAge;
			p.tint = this.spec.colors[0];
			p.speed = RNG.randomFloat(this.spec.minSpeed, this.spec.maxSpeed);
			let r = 2 * this.spec.maxRadius;
			p.width = r;
			p.height = r;

			if (this.spec.angle != undefined) {
				let deg = this.spec.angle;
				let angle = (deg - 135) * Math.PI / 180;
				p.dx = (Math.cos(angle) - Math.sin(angle)) * p.speed
				p.dy = (Math.sin(angle) + Math.cos(angle)) * p.speed
				p.dx += RNG.randomFloat(-this.spec.deviation, this.spec.deviation);
				p.dy += RNG.randomFloat(-this.spec.deviation, this.spec.deviation);
			} else {
				p.dx = RNG.randomFloat(-this.spec.deviation, this.spec.deviation) * p.speed;
				p.dy = RNG.randomFloat(-this.spec.deviation, this.spec.deviation) * p.speed;
			}

			emi.particles.push(p);
		}

		this._emissions.push(emi);
	}

	update() {
		this._emissions = this._emissions.filter(function(e) {
			return !e.ended;
		});
		this._emissions.forEach((emi) => {
			if (emi.delay) {
				// once the configured delay has passed we update the emission
				if (emi.delay.frames >= emi.delay.maxFrames) {
					this.processEmission(emi);
					emi.delay.frames = 0;
				} else {
					// skip frames until the configured delay is reached
					emi.delay.frames++;
				}
			} else {
				this.processEmission(emi);
			}
		});
	}

	processEmission(emi) {
		// if set to true at the end of the particle processing, we consider the emission as "ended"
		let allDead = true;

		for (let p of emi.particles) {
			// update only living particles
			if (p.age > 0) {
				p.x += p.dx;
				p.y += p.dy;
				p.age--;
				allDead = false;

				// apply gravity if set, default is 0
				p.dy += this.spec.gravity;

				// percentage of a particles lifespan
				let lifePercent = p.age/this.spec.maxAge;

				// cycle through the color list based on the age to maxage percentage
				let colorIndex = Math.floor((1 - lifePercent) * this.spec.colorCount);
				p.tint = this.spec.colors[colorIndex];

				// the lifetime percentage determines the radius
				let r = lifePercent * this.spec.maxRadius;
				p.width = r * 2;
				p.height = r * 2;
			} else if (!p.released) {
				// release every dead particles back to the pool
				this._particlePool.release(p);
			}
		}

		// end the emission if all particles are dead,
		// call optional onEnd callback
		emi.ended = allDead;
	}
}

export default ParticleEmitter;