import { error } from "../../../../../src/utils/Log.js";
import HPUpdateAnimation from "../HPUpdateAnimation.js";
import AnimationPhase from "./AnimationPhase.js";


// We decouple this from game logic, so the AI does not need to know if a player was hurt already.
// This could be inefficient, but typically only a couple of Animations are scheduled
// as an ENEMY_ATTACK per turn (incl. HPUpdateAnimation of the player).
function _preprocessHealthUpdates() {
	// Make sure we don't double schedule a HPUpdateAnimation for the player
	let maxPlayerDamage = 0;
	let firstPlayerHPUpdateAnimation;
	for (let anim of this.animations) {
		if (anim instanceof HPUpdateAnimation && anim.actor.isPlayer) {
			maxPlayerDamage += anim.getHPDelta();
			if (!firstPlayerHPUpdateAnimation) {
				firstPlayerHPUpdateAnimation = anim;
			} else {
				// ignore all others
				anim.done();
			}
		}
	}
	if (firstPlayerHPUpdateAnimation) {
		firstPlayerHPUpdateAnimation.setNumber(maxPlayerDamage);
	}
}


// ALL available animation phases
const phaseRangedAttacksPlayer = new AnimationPhase({name: "RANGED_ATTACKS_PLAYER"});
const phaseRangedAttacksEnemies = new AnimationPhase({
	name: "RANGED_ATTACKS_ENEMIES",
	preprocess: _preprocessHealthUpdates
});
const phaseGeneral = new AnimationPhase({name: "GENERAL"});
const phaseItemUsage = new AnimationPhase({name: "ITEM_USAGE"});
const phaseStatusEffects = new AnimationPhase({name: "STATUS_EFFECT"});
const phaseEnemyAttack = new AnimationPhase({
	name: "ENEMY_ATTACK",
	preprocess: _preprocessHealthUpdates
});
const phaseEndOfTurn = new AnimationPhase({name: "END_OF_TURN"});

// Maps the names of each phase to the instance
// allows to decouple the constants used by the game logic from the implementation
const _phaseMap = {
	"RANGED_ATTACKS_PLAYER": phaseRangedAttacksPlayer,
	"RANGED_ATTACKS_ENEMIES": phaseRangedAttacksEnemies,
	"GENERAL": phaseGeneral,
	"ITEM_USAGE": phaseItemUsage,
	"STATUS_EFFECT": phaseStatusEffects,
	"ENEMY_ATTACK": phaseEnemyAttack,
	"END_OF_TURN": phaseEndOfTurn
};

// chain phases
phaseRangedAttacksPlayer
	.then(phaseRangedAttacksEnemies)
	.then(phaseGeneral)
	.then(phaseItemUsage)
	.then(phaseStatusEffects)
	.then(phaseEnemyAttack)
	.then(phaseEndOfTurn);

// initial starting phase
let _startPhase = phaseRangedAttacksPlayer;
let _currentPhase = _startPhase;

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
				_currentPhase = _startPhase;
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