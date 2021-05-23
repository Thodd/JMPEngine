// JMP imports
import { assert } from "../../../../../src/utils/Log.js";

// own imports
import AnimationPool from "./AnimationPool.js";

class AnimationPhase {
	constructor(spec) {
		assert(spec && spec.name, "a name is mandatory for an AnimationPhase.", "AnimationPhase");

		this._name = spec.name
		this._preprocess = spec._preprocess || function(){};

		this._animations = [];

		this._nextPhase = null;
	}

	then(phase) {
		this._nextPhase = phase;
		return phase;
	}

	schedule(anim) {
		this._animations.push(anim);
	}

	update() {
		// If animations are scheduled, we process them and only then advance to the next player turn
		let animationCount = this._animations.length
		if (animationCount > 0) {
			// for simplicity we expect all animations to be finished,
			// and if one animation is unfinished the flag is set to false
			let allAnimationsDone = true;

			for (let i = 0; i < animationCount; i++) {
				let animation = this._animations[i];

				let done = animation._animate();

				if (!done) {
					// if at least one animation is not done, we keep on updating
					allAnimationsDone = false;
				}
			}

			if (allAnimationsDone) {
				// release all animations after they have all finished
				this._animations.forEach(AnimationPool.release);
				this._animations = [];

				// TODO: We could optimizes the release by flagging each animation instance
				//       and releasing it upon "done" during the first loop

				// all animations finished
				return true;
			} else {
				// some animations have not finished
				// we need to keep updating the animations in this phase until everything is finished
				return false;
			}
		} else {
			// no animations scheduled: phase is finished
			return true;
		}
	}
}

export default AnimationPhase;