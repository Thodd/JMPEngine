import { assert } from "../../../../../src/utils/Log.js";
import AnimationPhase from "./AnimationPhase.js";

class AnimationSystem {
	constructor() {
		this._phases = [];
	}

	/**
	 * Adds a set of animation phases to the AnimationSystem.
	 * @param {string[]|object[]} phases list of all animation phases for this AnimationSystem instance
	 */
	addPhases(phases) {
		// create AnimationPhases instances
		phases.forEach((p) => {
			let animPhase = p;

			// if a string or object is given, we make sure to create a valid AnimationPhase
			if (!(p instanceof AnimationPhase)) {
				let args = p;
				if (typeof args == "string") {
					args = {name: p};
				}
				animPhase = new AnimationPhase(args);
			}

			this._phases.push(animPhase);
		});

		// chain them together (last one has not successor)
		for (let i = 0; i < this._phases.length; i++) {
			let p = this._phases[i];
			p.then(this._phases[i+1]);
		}

		this._startPhase = this._phases[0];
		this._currentPhase = this._startPhase;
	}

	/**
	 * Schedules Animations for processing begining the next frame.
	 * @param {Animation|Animation[]} anims one or more animations
	 * @param {string} phaseName the name of the AnimationPhase in which the given animations should be played
	 */
	schedule(anims, phaseName) {
		// make sure we have an array
		if (!Array.isArray(anims)) {
			anims = [anims];
		}

		// get phase by name
		let phase = this._phases[phaseName];
		assert(phase != null, `No AnimationPhase with name '${phaseName}' found.`, "AnimationSystem");

		// relay scheduling to the animation phase
		phase.schedule(anims);
	}

	/**
	 * Updates the AnimationSystem.
	 * @returns {boolean} whether the update of all animations is finished or not
	 */
	update() {
		// quick sanity check to make sure animationphases have been created
		assert(this._currentPhase != null, "At least one AnimationPhase must be added to the AnimationSystem.", "AnimationSystem");

		let currentAnimationsDone = this._currentPhase.update();

		if (currentAnimationsDone) {
			this._currentPhase = this._currentPhase._nextPhase;

			// we advance to the next phase
			if (this._currentPhase != null) {
				// trigger preprocessing of the phase
				if (this._currentPhase._preprocess) {
					this._currentPhase._preprocess();
				}
				// restart updating with next phase
				return this.update();
			} else {
				// no further phases, we're done and reset to the first phase
				this._currentPhase = this._startPhase;
				return true;
			}
		} else {
			// current phase still has unfinished animations
			return false;
		}
	}
}

export default AnimationSystem;