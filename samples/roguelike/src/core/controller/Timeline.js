class Timeline {
	constructor() {
		this.actors = [];
		this.actorsToBeRemoved = [];
	}

	add(a) {
		this.actors.push(a);
	}

	remove(a) {
		// mark actor as removed so we don't give it a turn later on
		// this is important because an actor might be removed/die during another actors turn
		a._isRemoved = true;
		this.actorsToBeRemoved.push(a);
	}

	/**
	 * Called by the GameController when it's time to update all NPCs.
	 * This happens after the player has taken a turn.
	 */
	advanceNPCs() {
		// Now update all NPCs and schedule their animations too
		for (let i = 0, len = this.actors.length; i < len; i++) {
			let a = this.actors[i];
			// only actors which have not been removed are allowed to take a turn!!
			if (!a._isRemoved && a.active && !a.dead) {

				// TODO: Introduce WHILE loop to take more than 1 turn --> needs refactoring of animation scheduling
				//       (return animations after turn instead of scheduling directly)
				let timelineInfo = a.getTimelineInfo();
				if (timelineInfo.energy >= 100) {
					// actor takes turn
					a.takeTurn();
					// standard turn cost of 100 energy
					timelineInfo.energy -= 100;
				}

				timelineInfo.energy += timelineInfo.speed;
			}
		}

		// clean-up removed actors --> typically dead enemies
		// we do this afterwards, so we don't mess up the loop over all actors
		for (let a of this.actorsToBeRemoved) {
			let i = this.actors.indexOf(a);
			if (i >= 0) {
				this.actors.splice(i, 1);
			}
		}
		this.actorsToBeRemoved = [];
	}

}

export default Timeline;