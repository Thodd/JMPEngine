import { exposeOnWindow } from "../../../../../src/utils/Helper.js";
import { log, fail } from "../../../../../src/utils/Log.js";

const animations = {};

/**
 * Keeps a pool of animations, which can be reset and reused.
 * Helps to keep the # of Animation objects as low as possible,
 * so we don't keep recreating the same Animation objects over and over.
 */
const AnimationPool = {
	get(AnimationClass, info) {
		// we store the animations based on their class name
		if (!animations[AnimationClass.name]) {
			animations[AnimationClass.name] = [];
		}

		let anim = animations[AnimationClass.name].pop();

		if (!anim) {
			log(`new Animation instance created from class '${AnimationClass.name}.`, "AnimationPool");
			anim = new AnimationClass();
		}

		// set some arbitrary info to the animation, used by the animation for processing
		anim.setInfo(info);
		anim.reset();

		return anim;
	},

	_pool() {
		return animations;
	},

	release(anim) {
		// check if the anim is finished, only finished animations should be released
		if (anim.isDone()) {
			if (anim._isChain) {
				// release nested animations
				anim._release();
				// release the ChainAnimation itself, see below
			}
			animations[anim.constructor.name].push(anim);
		} else {
			fail(`releasing unfinished animation of type ${anim.constructor.name}!`, "AnimationPool");
		}
	}
};

exposeOnWindow("AnimationPool", AnimationPool);

export default AnimationPool;