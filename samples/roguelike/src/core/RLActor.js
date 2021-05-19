import { warn } from "../../../../src/utils/Log.js";
import RNG from "../../../../src/utils/RNG.js";
class RLActor {
	constructor() {
		this._cell = null;
		this.x = null;
		this.y = null;

		// can be turned off, so the actor does not take a turn, even if its added to a Timeline
		this.isActive = true;
		this.isVisible = true;

		this._isDead = false;

		// default timeline info for turn scheduling
		this._timelineInfo = {
			speed: 100,
			energy: 100
		};

		this._renderInfo = {
			id: 0,
			color: 0xFFFFFF,
			background: undefined
		};
	}

	// ********* Visual Rendering Information Setters/Getters *********
	set id(v) {
		this.dirty();
		this._renderInfo.id = v;
	}

	get id() {
		return this._renderInfo.id;
	}

	set color(v) {
		this.dirty();
		this._renderInfo.color = v;
	}

	get color() {
		return this._renderInfo.color;
	}

	set background(v) {
		this.dirty();
		this._renderInfo.background = v;
	}

	get background() {
		return this._renderInfo.background;
	}
	// ***************************************************************

	/**
	 * Marks the RLActor as dirty.
	 * Extends to its RLCell and the containing RLMap.
	 * @public
	 */
	dirty() {
		if (this._cell) {
			this._cell.dirty();
		}
	}

	/**
	 * Marks an actor as dead.
	 * Dead actors are removed from the game entirely, including the Timeline.
	 */
	set isDead(v) {
		if (this._cell) {
			if (v != true) {
				warn("An Actor cannot be set to 'undead'. Something went wrong...", "ActorBase");
			}
			this._isDead = true;

			// first remove the actor from the timeline...
			this.getTimeline().remove(this);
			// ... then remove it from its cell
			this.removeFromCell();
		} else {
			warn("Cannot set 'isDead' for an actor that was not added to a Cell yet!", "ActorBase");
		}
	}

	/**
	 * Returns whether the actor is dead.
	 */
	get isDead() {
		return this._isDead;
	}

	/**
	 * Encourages the RLActor to take a turn.
	 * Gameplay logic should happen here.
	 * @public
	 */
	takeTurn() {}

	/**
	 * Returns the timeline information.
	 * @returns {object}
	 */
	getTimelineInfo() {
		return this._timelineInfo;
	}

	/**
	 * Moves the RLActor to the given position in its RLMap.
	 * @param {int} x x-coordinate
	 * @param {int} y y-coordinate
	 * @returns {boolean} whether the move could be performed
	 * @public
	 */
	moveTo(x, y) {
		if (this._cell) {
			let targetCell = this._cell._map.get(x,y);
			if (targetCell) {
				return this.moveToCell(targetCell);
			} else {
				warn(`Cannot move RLActor to (${x},${y}). RLCell does not exist. Coordinates out of bounds?`, "RLActor");
			}
		} else {
			warn(`Cannot move RLActor to (${x},${y}). RLActor is not yet added to an RLCell`, "RLActor");
		}
		return false;
	}

	/**
	 * Moves the actor to the given RLCell.
	 * @param {RLCell} cell the new cell
	 * @returns {boolean} whether the move could be performed
	 * @public
	 */
	moveToCell(cell) {
		if (cell) {
			this.removeFromCell();
			cell.addActor(this);
			return true;
		} else {
			warn("RLActor cannot be moved to undefined cell!", "RLActor")
		}
		return false;
	}

	/**
	 * Tries to move an RLActor to a given RLCell while checking if the goal Cell is free.
	 * Returns whether the move could be performed.
	 *
	 * @param {RLCell} cell the cell to which the actor should be moved
	 * @returns {boolean} whether the move could be performed
	 */
	moveToWithCollision(cell) {
		if (cell && cell.isFree()) {
			this.moveToCell(cell);
			return true;
		}
		return false;
	}

	/**
	 * Very simple "step-towards" logic.
	 * Compares the coordinates and randomly picks a tile closer to the target actor.
	 * Obviously not as clever as using Dijkstra or A*, but good enough for a simple AI.
	 */
	moveTowardsActor(targetActor) {
		let myCell = this.getCell();
		let targetCell = targetActor.getCell();
		let dx = -1 * Math.sign(myCell.x - targetCell.x);
		let dy = -1 * Math.sign(myCell.y - targetCell.y);

		let possibleGoalTiles = [];

		if (dx != 0) {
			possibleGoalTiles.push(myCell.getRelative(dx, 0));
		}
		if (dy != 0) {
			possibleGoalTiles.push(myCell.getRelative(0, dy));
		}

		// decide if we take the horizontal or vertical tile first
		let r = RNG.random() > 0.5;
		let firstTile = r ? possibleGoalTiles[0] : possibleGoalTiles[1];
		let secondTile = !r ? possibleGoalTiles[0] : possibleGoalTiles[1];

		// try first movement possibility
		let moveMade = this.moveToWithCollision(firstTile);

		// try second possibility (if any)
		if (secondTile && !moveMade) {
			this.moveToWithCollision(secondTile);
		}
	}

	/**
	 * Removes the actor from its RLCell (if its added).
	 * @public
	 */
	removeFromCell() {
		if (this._cell) {
			this._cell.removeActor(this);
		}
	}


	/**
	 * Checks if this RLActor is standing one tile away from the given actor.
	 *
	 * @param {RLActor} actor the actor to check
	 * @param {boolean} diagonal whether diagonal tiles should be checked
	 * @public
	 */
	isStandingAdjacent(actor, diagonal = false) {
		let c1 = this.getCell();
		let c2 = actor.getCell();
		// might happen that the actor we want to check is not added to a cell anymore,
		// e.g. when it died the same turn
		if (c1 && c2) {
			let xDif = Math.abs(c1.x - c2.x);
			let yDif = Math.abs(c1.y - c2.y);

			// anything farther than 1 is not considered "adjacent"
			if (xDif > 1 || yDif > 1) {
				return false;
			}

			if (diagonal) {
				if (xDif === 1 || yDif === 1) {
					return true;
				}
			} else {
				return (xDif === 1 && yDif === 0) || (xDif === 0 && yDif === 1);
			}
		}
		return false;
	}

	// ********* Convenience functions *********

	/**
	 * Returns the cell to which this actor is added.
	 * @returns {RLCell|undefined}
	 * @public
	 */
	getCell() {
		return this._cell;
	}

	/**
	 * Returns the containing RLMap, in case the RLActor is added to an RLCell.
	 * @returns {RLMap|undefined}
	 * @public
	 */
	getMap() {
		if (this._cell) {
			return this._cell.getMap();
		} else {
			warn("RLMap, RLMapController or AnimationSystem for RLActor cannot be retrieved since the actor is not added to an RLCell yet.", "RLActor")
		}
	}

	/**
	 * Shorthand convenience function to retrieve the JMP Engine Screen instance
	 * associated with this RLActor.
	 * Only returns something if the RLActor is added to an RLCell in an RLMap.
	 * @returns {Screen|null}
	 * @public
	 */
	getScreen() {
		let map = this.getMap();
		return map && map.getScreen();
	}

	/**
	 * Shorthand convenience function to retrieve the RLMapController instance
	 * associated with this RLActor.
	 * Only returns something if the RLActor is added to an RLCell in an RLMap.
	 * @returns {RLMapController|undefined}
	 * @public
	 */
	getController() {
		let map = this.getMap();
		return map && map.getController();
	}

	/**
	 * Shorthand convenience function to retrieve the Timeline instance
	 * associated with this RLActor.
	 * Only returns something if the RLActor is added to an RLCell in an RLMap.
	 * @returns {Timeline|undefined}
	 * @public
	 */
	getTimeline() {
		let ctr = this.getController();
		return ctr && ctr.getTimeline();
	}

	/**
	 * Shorthand convenience function to retrieve the AnimationSystem instance
	 * associated with this RLActor.
	 * Only returns something if the RLActor is added to an RLCell in an RLMap.
	 * @returns {AnimationSystem|undefined}
	 * @public
	 */
	getAnimationSystem() {
		let ctr = this.getController();
		return ctr && ctr.getAnimationSystem();
	}

	/**
	 * Shorthand convenience function to retrieve the player actor instance
	 * associated with this RLActor.
	 * Only returns something if the RLActor is added to an RLCell in an RLMap.
	 * @returns {RLActor|undefined} the player actor or undefined if this RLActor is not added to an RLCell
	 * @public
	 */
	getPlayerActor() {
		let map = this.getMap();
		if (map) {
			return map.getPlayerActor();
		} else {
			warn("Could not retrieve player actor via RLActor. The RLActor is not added to an RLCell.", "RLActor");
		}
	}

}

export default RLActor;