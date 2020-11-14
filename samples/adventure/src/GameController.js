import AnimationPool from "./animations/AnimationPool.js";
//import { log } from "../../../src/utils/Log.js";

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
		// Nothing to control until the player has made a move:
		// Animations which need to be in sync with the game-logic e.g. movement or attacking will be handled by the GC,
		// other animations or visual effects are just normal engine entities, as they don't effect the gameplay
		if (this.waitingForPlayer) {
			return;
		}

		// update all animations
		let animationCount = this.animations.length
		if (animationCount > 0) {
			// for simplicity we expect all animations to be finished,
			// and if one animation is unfinished the flag is set to false
			let allAnimationsDone = true;

			for (let i = 0; i < animationCount; i++) {
				let animation = this.animations[i];

				// skip finished animations
				if (!animation._isDone) {
					let done = animation.animate();

					// if at least one animation is not done, we keep on updating
					if (!done) {
						allAnimationsDone = false;
					} else {
						//debug: count released animations (does not include sub-animations of ChainAnimation instances)
						//this.animations._released = this.animations._released || 0;
						//this.animations._released++;

						// important: always release an animation once it's done
						AnimationPool.release(animation);
					}
				}
			}

			if (allAnimationsDone) {
				//log(`processed ${this.animations._released}/${animationCount} animations`, "GameController");
				this.animations = [];
			} else {
				// break out:
				// we keep updating animations frame by frame until everything is finished
				return;
			}
		}


		if (this.nextActorPriority === "Player") {
			// now give the player priority to do inputs
			this.player.takeTurn();

			// we now keep waiting until the player has made their turn
			this.waitingForPlayer = true;

			// and schedule all Other actors for update priority next time
			this.nextActorPriority = "Other";

			return ;
		}


		if (this.nextActorPriority === "Other") {
			// update actors
			for (let i = 0, len = this.actors; i < len; i++) {
				let a = this.actors[i];
				let animations = a.takeTurn();
				// schedule any given animation, e.g. movement, hurting, attacking, ...
				if (animations.length > 0) {
					this.animations.push(...animations);
				}
			}

			// after the animations have finished we now pass priority to the player
			this.nextActorPriority = "Player";

			return;
		}

	}

	// called by the player once they end their turn
	// players gives us all animations which will be player next
	endPlayerTurn(playerAnimations) {
		this.waitingForPlayer = false;

		// schedule the animations started by the player class
		this.animations.push(...playerAnimations);
	}
}

export default GameController;