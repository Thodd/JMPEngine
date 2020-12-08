import AnimationPool from "./AnimationPool.js";

/**
 * The AnimationSystem handles the scheduling and updating of animations.
 */
class AnimationSystem {
	constructor() {
		this.animations = [];
	}

	schedule(anims) {
		if (!Array.isArray(anims)) {
			anims = [anims];
		}
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

			} else {
				// break out: some animations have not finished
				// we keep updating animations until everything is finished
				return false;
			}
		} else {
			// no animations to run
			return true;
		}
	}
}

export default AnimationSystem;