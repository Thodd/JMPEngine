import AnimationSystem from "../../animations/AnimationSystem.js";
// import { log } from "../../../src/utils/Log.js";

class GameController {
	constructor() {
		this.animationSystem = new AnimationSystem();

		this.actors = [];
		this.actorsToBeRemoved = [];

		this.nextActorPriority = "Player";
	}

	addActor(a) {
		this.actors.push(a);
	}

	removeActor(a) {
		// mark actor as removed so we don't give it a turn later on
		// this is important because an actor might be removed/die during another actors turn
		a._isRemoved = true;
		this.actorsToBeRemoved.push(a);
	}

	addPlayer(p) {
		this.player = p;
	}

	update() {
		let animationsFinished = this.animationSystem.update();

		if(animationsFinished) {
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
	endPlayerTurn() {
		// retrieve all animations scheduled by the player & reset
		let playerAnimations = this.player._scheduledAnimations;
		this.player._scheduledAnimations = [];
		this.waitingForPlayer = false;

		// schedule player animations
		this.animationSystem.schedule(playerAnimations);

		// Now update all NPCs and schedule their animations too
		for (let i = 0, len = this.actors.length; i < len; i++) {
			let a = this.actors[i];
			// only actors which have not been removed are allowed to take a turn!!
			if (!a._isRemoved) {
				// actor takes turn, retrieve scheduled animations & reset
				a.takeTurn();
				let animations = a._scheduledAnimations;
				a._scheduledAnimations = [];

				// schedule actor animations
				this.animationSystem.schedule(animations);
			}
		}

		// clean-up removed actors --> typically dead enemies
		for (let a of this.actorsToBeRemoved) {
			let i = this.actors.indexOf(a);
			if (i >= 0) {
				this.actors.splice(i, 1);
			}
		}
	}
}

export default GameController;