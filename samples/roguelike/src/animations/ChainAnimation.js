import AnimationPool from "./system/AnimationPool.js";
import BaseAnimation from "./BaseAnimation.js";

/**
 * ChainAnimations allow to build a timeline/graph of animations.
 * Each animation added to the chain will be executed in the order they have been added.
 *
 * Nesting ChainAnimations is also possible.
 */
class ChainAnimation extends BaseAnimation {
	constructor() {
		super();
		// chain animations are chains... :x
		// used by the AnimationSystem to handle the release of nested animations
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

	animate() {
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
	}
}

export default ChainAnimation;