import AnimationPool from "./AnimationPool.js";
import BaseAnimation from "./BaseAnimation.js";

/**
 * ChainAnimations allow to build a timeline/graph of animations.
 * Each animation added to the chain will be executed in the order they have been added.
 *
 * Nesting ChainAnimations is also possible.
 */
class ChainAnimation extends BaseAnimation {
	release() {
		// release all nested animation
		for (let i = 0, len = this.chain.length; i < len; i++) {
			AnimationPool.release(this.chain[i]);
		}

		this.reset();
	}

	reset() {
		super.reset();
		this.chain = [];
		this.currentIndex = 0;
	}

	add(animation) {
		this.chain.push(animation);
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
			this._isDone = true;
		}

		return this._isDone;
	}

	isDone() {
		return this._isDone;
	}
}

export default ChainAnimation;