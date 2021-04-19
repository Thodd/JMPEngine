import AnimationPool from "./AnimationPool.js";

/**
 * AnimationPhase class.
 * Stores scheduled animation and performs the animation updates.
 */
class AnimationPhase {
	constructor({name, preprocess}) {
		this.name = name;
		this.animations = [];
		this.nextPhase = null;

		// a phase might have a preprocessor
		// e.g. to consolidate duplicate animations before playing them
		this.preprocess = preprocess;
	}

	then(phase) {
		this.nextPhase = phase;
		return phase;
	}

	schedule(anims) {
		this.animations.push(...anims);
	}

	update() {
		// If animations are scheduled, we process them and only then advance to the next player turn
		let animationCount = this.animations.length
		if (animationCount > 0) {
			// for simplicity we expect all animations to be finished,
			// and if one animation is unfinished the flag is set to false
			let allAnimationsDone = true;

			for (let i = 0; i < animationCount; i++) {
				let animation = this.animations[i];

				let done = animation._animate();

				if (!done) {
					// if at least one animation is not done, we keep on updating
					allAnimationsDone = false;
				}
			}

			if (allAnimationsDone) {
				// release all animations after they have all finished
				this.animations.forEach(AnimationPool.release);
				this.animations = [];

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