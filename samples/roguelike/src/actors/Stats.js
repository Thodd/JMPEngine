import EventBus from "../../../../src/utils/EventBus.js";

import Constants from "../Constants.js";

class Stats {
	constructor(fireEvents) {
		this._fireEvents = fireEvents;
		this._hp_max = 2;
		this._hp = 2;

		// speed & energy
		// speed == energy consumption per turn
		this._speed = 100;
		// energy == the currently accumulated energy (+ this._speed each turn)
		this._energy = 100;

	}

	_statChange() {
		// fire events on each stat change, only the PlayerState is registered to the stat change -> UI Update needed
		if (this._fireEvents) {
			EventBus.publish(Constants.Events.LOGIC_UPDATE_STATS, this);
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