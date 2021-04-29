class RLActor {
	constructor() {
		this._cell = null;
		this.x = null;
		this.y = null;

		this._renderInfo = {
			id: 0,
			color: 0xFFFFFF,
			bg: undefined
		};
	}

	/**
	 * Marks the RLActor as dirty.
	 * Extends to its RLCell and the containing RLMap.
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
	 */
	moveTo() {

	}

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
}

export default RLActor;