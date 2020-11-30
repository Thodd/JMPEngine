import AnimationPool from "../../animations/AnimationPool.js";
// import { log } from "../../../src/utils/Log.js";

class GameController {
	constructor() {
		this.animations = [];
		this.actors = [];

		this.nextActorPriority = "Player";
	}

	addActor(a) {
		this.actors.push(a);
	}

	addPlayer(p) {
		this.player = p;
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
				// break out:
				// we keep updating animations until everything is finished
				return;
			}
		} else {
			// Nothing to control until the player has made a move:
			// Animations which need to be in sync with the game-logic e.g. movement or attacking will be handled by the GC,
			// other animations or visual effects are just normal engine entities, as they don't effect the gameplay
			if (this.waitingForPlayer) {
				return;
			}

			// now give the player priority to do inputs
			this.player.takeTurn();

			// we now keep waiting until the player has made their turn
			this.waitingForPlayer = true;
		}

	}

	// called by the player once they end their turn
	// players gives us all animations which will be played next
	endPlayerTurn(playerAnimations) {
		this.waitingForPlayer = false;

		// schedule the animations started by the player class
		this.animations.push(...playerAnimations);

		// Now update all NPCs and schedule their animations too
		for (let i = 0, len = this.actors.length; i < len; i++) {
			let a = this.actors[i];
			let animations = a.takeTurn();
			// schedule any given animation, e.g. movement, hurting, attacking, ...
			if (animations.length > 0) {
				this.animations.push(...animations);
			}
		}
	}
}

export default GameController;