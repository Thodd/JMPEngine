import { error } from "../../../../../src/utils/Log.js";
import HurtAnimation from "../HurtAnimation.js";
import AnimationPhase from "./AnimationPhase.js";

// Create Phases
const phaseGeneral = new AnimationPhase({name: "GENERAL"});
const phaseStatusEffects = new AnimationPhase({name: "STATUS_EFFECT"});
const phaseEnemyAttack = new AnimationPhase({
	name: "ENEMY_ATTACK",
	preprocess: function() {
		// We decouple this from game logic, so the AI does not need to know if a player was hurt already.
		// This could be inefficient, but typically only a couple of Animations are scheduled
		// as an ENEMY_ATTACK per turn (incl. HurtAnimation of the player).

		// TODO: Refactor the whole AnimationPhase creation... how can we get this away from the AnimationSystem class?
		// ********** TODO ***********
		// Make sure we don't double schedule a HurtAnimation for the player
		let doubleHurtPlayer = false;
		for (let a of this.animations) {
			if (a instanceof HurtAnimation && a.actor.isPlayer) {
				if (doubleHurtPlayer) {
					a.done();
				}
				doubleHurtPlayer = true;
			}
		}
		// ********** TODO ***********
	}
});
const phaseEndOfTurn = new AnimationPhase({name: "END_OF_TURN"});

// Maps the names of each phase to the instance
// allows to decouple the constants used by the game logic from the implementation
const _phaseMap = {
	"GENERAL": phaseGeneral,
	"STATUS_EFFECT": phaseStatusEffects,
	"ENEMY_ATTACK": phaseEnemyAttack,
	"END_OF_TURN": phaseEndOfTurn
};

// chain phases
phaseGeneral
	.then(phaseStatusEffects)
	.then(phaseEnemyAttack)
	.then(phaseEndOfTurn);

// initial starting phase
let _currentPhase = phaseGeneral;

/**
 * The AnimationSystem handles the scheduling and updating of the AnimationPhases.
 */
class AnimationSystem {
	/**
	 * Schedules a list of animations to the given animation phase.
	 * @param {BaseAnimation[]} anims list of animations to schedule, subclasses of BaseAnimations
	 * @param {string} phaseName name of the phase to which the animation(s) should be scheduled
	 */
	schedule(anims, phaseName) {
		// make sure we have an array
		if (!Array.isArray(anims)) {
			anims = [anims];
		}

		// get phase by name
		let phase = _phaseMap[phaseName];
		if (!phase) {
			error(`No AnimationPhase with name '${phaseName}' found. Defaulting to AnimationPhase '${phaseGeneral.name}'.`, "AnimationSystem");
			phase = phaseGeneral;
		}

		// relay scheduling to the animation phase
		phase.schedule(anims);
	}

	/**
	 * Updates the animations scheduled in each animation phases.
	 * Automatically advances to the next animation phase.
	 */
	update() {
		let currentAnimationsDone = _currentPhase.update();

		if (currentAnimationsDone) {
			_currentPhase = _currentPhase.nextPhase;

			// we advance to the next phase
			if (_currentPhase != null) {
				// trigger preprocessing of the phase
				if (_currentPhase.preprocess) {
					_currentPhase.preprocess();
				}
				// restart updating with next phase
				return this.update();
			} else {
				// no further phases, we're done and reset to the first phase
				_currentPhase = phaseGeneral;
				return true;
			}
		} else {
			// current phase still has unfinished animations
			return false;
		}
	}
}

// generate public constants for usage in game logic
AnimationSystem.Phases = {};
for (let phaseName in _phaseMap) {
	AnimationSystem.Phases[phaseName] = phaseName;
}

export default AnimationSystem;