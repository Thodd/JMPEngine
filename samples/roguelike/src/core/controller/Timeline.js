class Timeline {
	constructor() {
		this.actors = [];
		this.actorsToBeRemoved = [];
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

	/**
	 * Called by the GameController when it's time to update all NPCs.
	 * This happens after the player has taken a turn.
	 */
	advanceNPCs() {
		// Now update all NPCs and schedule their animations too
		for (let i = 0, len = this.actors.length; i < len; i++) {
			let a = this.actors[i];
			// only actors which have not been removed are allowed to take a turn!!
			if (!a._isRemoved && a.isActive) {

				// check energy level: actor has not enough energy to take a turn
				// TODO: This can be optimized by minimizing function calls -> access stats directly
				//       Only do this should we see performance issues with thousands of NPCs!
				// TODO: Introduce WHILE loop to take more than 1 turn --> needs refactoring of animation scheduling
				//       (return animations after turn instead of scheduling directly)
				let stats = a.getStats();
				if (stats.energy >= 100) {
					// actor takes turn, retrieve scheduled animations & reset
					a.takeTurn();
					a.resetSinceLastTurnInfo();
					// standard turn cost of 100 energy
					stats.energy -= 100;
				}

				stats.energy += stats.speed;
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
	}

}

export default Timeline;