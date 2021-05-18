import EventBus from "../../../../../src/utils/EventBus.js";

import Events from "../Events.js";

class Stats {
	constructor(fireEvents) {
		this._fireEvents = fireEvents;
		this._hp_max = 2;
		this._hp = 2;

		this._timelineInfo = {
			speed: 100,
			energy: 100
		};
	}

	_statChange() {
		// fire events on each stat change, only the PlayerState is registered to the stat change -> UI Update needed
		if (this._fireEvents) {
			EventBus.publish(Events.UPDATE_STATS, this);
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
		this._timelineInfo.speed = v;
	}
	get speed() {
		return this._timelineInfo.speed;
	}

	// energy
	set energy(v) {
		this._timelineInfo.energy = v;
	}
	get energy() {
		return this._timelineInfo.speed;
	}
}

export default Stats;