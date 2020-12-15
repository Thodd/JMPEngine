class Stats {
	constructor(changeCallback) {
		this._changeCallback = changeCallback;
		this._hp_max = 3;
		this._hp = 3;
		this._atk = 1;
		this._def = 1;
	}

	_statChange() {
		if (this._changeCallback) {
			this._changeCallback();
		}
	}

	// HP MAX
	set hp_max(v) {
		this._hp_max = v;
		this._statChange();
	}
	get hp_max() {
		return this._hp_max;
	}

	// HP
	set hp(v) {
		this._hp = v;
		this._statChange();
	}
	get hp() {
		return this._hp;
	}

	// ATK
	set atk(v) {
		this._atk = v;
		this._statChange();
	}
	get atk() {
		return this._atk;
	}

	// DEF
	set def(v) {
		this._def = v;
		this._statChange();
	}
	get def() {
		return this._def;
	}
}

export default Stats;