import ActorBase from "./ActorBase.js";
import EquipmentSlots from "../inventory/EquipmentSlots.js";

class EnemyBase extends ActorBase {
	/**
	 * Sets the initial stats of the Enemy.
	 * @param {object} spec a map of all stats that should be set
	 * @override
	 */
	defineStats(spec) {
		this._stats.hp = spec.hp;
		this._stats.hp_max = spec.hp;

		// speed is handled via the Timeline Info
		this._stats._timelineInfo.speed = spec.speed;
	}

	/**
	 * @override
	 */
	equipInitialWeapon(w) {
		this.getBackpack().addItem(w);
		this.getBackpack().equipItem(w, EquipmentSlots.MELEE);
	}
}

export default EnemyBase;