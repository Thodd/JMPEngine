class Stats {
	constructor(changeCallback) {
		this._changeCallback = changeCallback;
		this._hp_max = 2;
		this._hp = 2;

		// speed & energy
		// speed == energy consumption per turn
		this._speed = 100;
		// energy == the currently accumulated energy (+ this._speed each turn)
		this._energy = 100;

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
		// clamp to max hp
		this._hp = Math.min(this._hp, this._hp_max);
		this._statChange();
	}
	get hp() {
		return this._hp;
	}

	// Speed
	set speed(v) {
		this._speed = v;
	}
	get speed() {
		return this._speed;
	}

	// energy
	set energy(v) {
		this._energy = v;
	}
	get energy() {
		return this._energy;
	}
}

export default Stats;