import AnimationSystem from "../animations/system/AnimationSystem.js";
import Timeline from "./Timeline.js";
// import { log } from "../../../src/utils/Log.js";

class GameController {
	constructor() {
		this.animationSystem = new AnimationSystem();
		this.timeline = new Timeline();

		this.player = null;
	}

	getAnimationSystem() {
		return this.animationSystem;
	}

	getTimeline() {
		return this.timeline;
	}

	addPlayer(p) {
		this.player = p;
	}

	endPlayerTurn() {
		// we synchronously calculate all NPC turns & schedule their animations
		this.timeline.advanceNPCs();

		// which goes over to the animation phase again
		this.animationsRunning = true;
	}

	update() {
		// during the animation phase we update the system
		if (this.animationsRunning) {
			let animationsFinished = this.animationSystem.update();

			if (animationsFinished) {
				// now give the player priority to do inputs
				this.player.takeTurn();

				// we wait for the player & NPC turns to end now for the next animation phase
				this.animationsRunning = false;
			}
		}
	}
}

export default GameController;