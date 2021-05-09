import { warn } from "../../../../src/utils/Log.js";
class RLActor {
	constructor() {
		this._cell = null;
		this.x = null;
		this.y = null;

		// can be turned off, so the actor does not take a turn, even if its added to a Timeline
		this.isActive = true;
		this.isVisible = true;

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

	// TODO: Move the actor relative if x/y are directly changed
	// TODO: implement > move(cell)
	// TODO: implement > removeFromCell()
	set x(v){}
	get x() {}

	set y(v) {}
	get y() {}

	/**
	 * Moves the actor to the given RLCell.
	 * @param {RLCell} cell the new cell
	 * @public
	 */
	moveTo(cell) {
		if (cell) {
			this.removeFromCell();
			cell.addActor(this);
		} else {
			warn("Actor cannot be moved to undefined cell!", "RLActor")
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