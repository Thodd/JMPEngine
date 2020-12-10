import { fail } from "../../../../src/utils/Log.js";
import AnimationPool from "./AnimationPool.js";

class AnimationPhase {
	constructor(name) {
		this.name = name;
		this.animations = [];
		this.nextPhase = null;
	}

	then(phase) {
		this.nextPhase = phase;
		return this;
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

			} else {
				// break out: some animations have not finished
				// we keep updating animations until everything is finished
				return false;
			}
		} else {
			// move to next phase
			if (this.nextPhase) {
				return this.nextPhase.update();
			} else {
				// no animations to run
				return true;
			}
		}
	}
}

// map of all phases, keyed by name, value is the processing order id
// used for scheduling
const _phaseNameToProcessingOrder = {};

// Map the names on each other for debugging
// this decouples the ordering
const _phaseConstants = {};

// All Phases
const phaseGeneral = new AnimationPhase("GENERAL");
const phaseStatusEffects = new AnimationPhase("STATUS_EFFECT");
const phaseEnemyAttack = new AnimationPhase("ENEMY_ATTACK");
const phaseEndOfTurn = new AnimationPhase("END_OF_TURN");

const _allPhasesOrdered = [
	phaseGeneral,
	phaseStatusEffects,
	phaseEnemyAttack,
	phaseEndOfTurn
];

let _lastPhase = null;
for (let i = 0; i < _allPhasesOrdered.length; i++) {
	let nextPhase = _allPhasesOrdered[i];

	// track phase names and processing order
	_phaseNameToProcessingOrder[nextPhase.name] = i;
	_phaseConstants[nextPhase.name] = nextPhase.name;

	// chain phases
	if (_lastPhase) {
		_lastPhase.then(nextPhase);
	}
	_lastPhase = nextPhase;
}

/**
 * The AnimationSystem handles the scheduling and updating of animations.
 */
class AnimationSystem {
	/**
	 * Schedules a list of animations to the given animation phase.
	 * @param {BaseAnimation[]} anims list of animations to schedule, subclasses of BaseAnimations
	 * @param {int} phaseId=0 processing order ID of the AnimationPhase to which the animations should be scheduled
	 */
	schedule(anims, phaseId=0) {
		if (!Array.isArray(anims)) {
			anims = [anims];
		}

		// relay scheduling to the animation phase
		let phase = _allPhasesOrdered[phaseId];
		if (phase) {
			phase.schedule(anims);
		} else {
			fail(`Unknown animation phase with ID '${phaseId}'!`, "AnimationSystem");
		}
	}

	update() {
		let animationsDone = phaseGeneral.update();

		if (animationsDone) {
			return true;
		} else {
			return false;
		}
	}
}

AnimationSystem.Phases = _phaseConstants;

export default AnimationSystem;