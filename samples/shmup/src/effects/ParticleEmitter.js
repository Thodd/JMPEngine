import Spritesheets from "../../../../src/assets/Spritesheets.js";
import PIXI from "../../../../src/core/PIXIWrapper.js";
import Entity from "../../../../src/game/Entity.js";
import RNG from "../../../../src/utils/RNG.js";

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
	constructor() {
		super();

		// container for particles sprites
		this._particleContainer = new PIXI.Container();
		this.configSprite({
			replaceWith: this._particleContainer
		});

		this._particlePool = new ParticlePool(this._particleContainer);

		// all active emissions
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

		emi.sheet = Spritesheets.getSheet(emi.sheet);

		// spawn particles
		while (emi.amount > 0) {
			emi.amount--;

			let p = this._particlePool.get(this._particleContainer);

			// set texture
			p.texture = emi.sheet.textures[0];

			p.released = false; // particle is retrieved & alive again
			p.x = emi.x;
			p.y = emi.y;
			p.age = emi.maxAge;
			p.tint = emi.colors[0];
			p.speed = RNG.randomInteger(1, emi.maxSpeed);
			p.dx = RNG.randomInteger(-1, 1) * p.speed;
			p.dy = RNG.randomInteger(-1, 1) * p.speed;

			emi.particles.push(p);
		}

		this._emissions.push(emi);
	}

	update() {
		this._emissions = this._emissions.filter(function(e) { return !e.ended; });
		this._emissions.forEach((emi) => {

			// skip frames until the configured delay is reached
			if (emi.delay) {
				emi.delay.frames++;
				if (emi.delay.frames <= emi.delay.maxFrames) {
					this.processEmission(emi);
				} else {
					emi.delay.frames = 0;
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
				p.dy += emi.gravity;

				// percentage of a particles lifespan
				let lifePercent = p.age/emi.maxAge;

				// cycle through the color list based on the age to maxage percentage
				let colorIndex = Math.floor((1 - lifePercent) * emi.colors.length);
				p.tint = emi.colors[colorIndex];

				// size sprite wrt. the radius
				let r = lifePercent * emi.maxRadius;
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
		if (emi.ended && emi.onEnd) {
			emi.onEnd();
		}
	}
}

export default ParticleEmitter;