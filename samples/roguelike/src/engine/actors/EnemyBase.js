import ActorBase from "./ActorBase.js";
import EquipmentSlots from "../inventory/EquipmentSlots.js";

class EnemyBase extends ActorBase {
	constructor(spec) {
		super();

		// setup
		this.defineVisuals(spec.visuals);
		this.defineStats(spec.stats);
		this.equipInitialWeapon(spec.weapon);
	}

	/**
	 * Defines the visuals of the Enemy.
	 */
	defineVisuals(v) {
		this.id = v.id
		this.color = v.color;
	}

	/**
	 * Sets the initial stats of the Enemy.
	 * @param {object} spec a map of all stats that should be set
	 */
	defineStats(spec) {
		this._stats.hp = spec.hp;
		this._stats.hp_max = spec.hp;

		// speed is handled via the Timeline Info
		this._stats._timelineInfo.speed = spec.speed;
	}

	/**
	 * Hook for equipping an initial weapon.
	 * Overwrite in subclasses.
	 */
	equipInitialWeapon(w) {
		this.getBackpack().addItem(w);
		this.getBackpack().equipItem(w, EquipmentSlots.MELEE);
	}
}

export default EnemyBase;