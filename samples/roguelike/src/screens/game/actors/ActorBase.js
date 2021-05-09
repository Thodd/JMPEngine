import RLActor from "../../../core/RLActor.js";

/**
 * Base class for all game Actors.
 * Enhances the RLActor class with additional things like Rooms, ...
 */
class ActorBase extends RLActor {
	/**
	 * Sets the Room for this Actor.
	 * @param {Room} r the room this actor belongs to
	 */
	setRoom(r) {
		this.room = r;
	}

	/**
	 * Returns the Room in which this actor is placed.
	 * @returns {Room} the Room of this actor
	 */
	getRoom() {
		return this.room;
	}
}

export default ActorBase;