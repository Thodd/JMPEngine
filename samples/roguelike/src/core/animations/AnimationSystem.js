// JMP imports
import { assert } from "../../../../../src/utils/Log.js";

// own imports
import AnimationPhase from "./AnimationPhase.js";

/**
 * AnimationSystem class.
 * Handles AnimationPhases and the general animation update cycle.
 * Used by the map controllers.
 */
class AnimationSystem {
	constructor() {
		this._phases = [];
		this._phasesByName = {};
	}

	/**
	 * Adds a set of animation phases to the AnimationSystem.
	 * @param {string[]|object[]} phases list of all animation phases for this AnimationSystem instance
	 */
	addPhases(phases) {
		// create AnimationPhases instances
		phases.forEach((p) => {
			// if a string is given, we make sure to create a valid AnimationPhase args object
			let args = p;
			if (typeof args == "string") {
				args = {name: p};
			}

			assert(args.name != null, "The given AnimationPhase definition does not contain a mandatory name!", "AnimationSystem");

			let animPhase = new AnimationPhase(args);
			this._phasesByName[args.name] = animPhase;

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
	 * @param {Animation} the animation to schedule
	 * @param {string} phaseName the name of the AnimationPhase in which the given animations should be played
	 */
	schedule(phaseName, anims) {
		let phase = this._phasesByName[phaseName];
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