import AnimationPool from "./AnimationPool.js";
import AnimationBase from "./AnimationBase.js";

/**
 * AnimationChains allow to build a sequence of consecutive of animations.
 * Each animation in the chain will be executed in the order they have been added.
 *
 * Nesting AnimationChains is also possible.
 */
class AnimationChain extends AnimationBase {
	constructor() {
		super();
		// chain animations are chains... :x
		// used by the AnimationPool to handle the release of nested animations
		this._isChain = true;
	}

	reset() {
		super.reset();
		this.chain = [];
		this.currentIndex = 0;
	}

	add(anims) {
		if(!Array.isArray(anims)) {
			anims = [anims];
		}
		this.chain.push(...anims);
	}

	_release() {
		// release all nested animations
		// IMPORTANT: chains might be nested too!
		for (let anim of this.chain) {
			AnimationPool.release(anim);
		}
	}

	_animate() {
		let animation = this.chain[this.currentIndex];

		if (animation) {
			if (!animation._isDone) {
				let done = animation._animate();
				if (done) {
					// advance to next animation in the chain
					this.currentIndex++;
				}
			}
		} else {
			// end of animation chain reached: currentIndex overflows the length of the chain-array
			this.done();
		}

		// don't forget to return the "done" state!
		return this._isDone;
	}
}

export default AnimationChain;