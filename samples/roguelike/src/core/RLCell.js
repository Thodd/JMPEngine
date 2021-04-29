class RLCell {
	constructor(map, x, y) {
		this._map = map;
		this.x = x;
		this.y = y;

		this._actors = [];

		this._renderInfo = {
			id: 0,
			color: 0xFFFFFF,
			bg: undefined
		};
	}

	/**
	 * Marks the RLCell as dirty.
	 * Extends to the containing RLMap.
	 */
	dirty() {
		this._map.dirty();
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

	getTopActor() {
		return this._actors[this._actors.length - 1];
	}

	addActor(a) {
		// only add actors which are not added to a cell already
		if (!a._cell) {
			this._actors.push(a);
			a._cell = this;
			this.dirty();
		}
	}

	removeActor(a) {
		if (a._cell == this) {
			let i = this._actors.indexOf(a);
			this._actors.splice(i, 1);
			a._cell = null;
			this.dirty();
		}
	}
}

export default RLCell;