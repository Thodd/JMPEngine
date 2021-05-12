import { warn } from "../../../../src/utils/Log.js";
class RLActor {
	constructor() {
		this._cell = null;
		this.x = null;
		this.y = null;

		// can be turned off, so the actor does not take a turn, even if its added to a Timeline
		this.isActive = true;
		this.isVisible = true;

		// default stats
		// includes information for on Timeline/Turn-Scheduling implementation
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
	 * Returns the timeline information.
	 * @returns {object}
	 */
	getTimelineInfo() {
		return this._timelineInfo;
	}

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
	 * Removes the actor from its RLCell (if its added).
	 * @public
	 */
	removeFromCell() {
		if (this._cell) {
			this._cell.removeActor(this);
		}
	}

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
	 * Encourages the RLActor to take a turn.
	 * Gameplay logic should happen here.
	 * @public
	 */
	takeTurn() {}
}

export default RLActor;