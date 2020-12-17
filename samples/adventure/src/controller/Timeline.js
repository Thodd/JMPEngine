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
			if (!a._isRemoved) {
				// actor takes turn, retrieve scheduled animations & reset
				a.takeTurn();
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

export default Timeline;