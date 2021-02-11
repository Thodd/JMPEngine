import EventBus from "../../../../src/utils/EventBus.js";
import Constants from "../Constants.js";

/**
 * PlayerState is kept across different Player instances.
 * @static
 */
const PlayerState = {

	stats: {
		hp_max: 4,
		hp: 4,
		dmg: 0 // damage is taken from the equipped weapon -> getDamageOutput()
	},

	takeDamage(dmg) {
		this.stats.hp -= dmg;
		EventBus.publish(Constants.Events.UPDATE_UI, {});
		return this.stats.hp <= 0;
	},

	getDamageOutput() {
		// TODO: Based on Weapon
		return 1;
	}
};

export default PlayerState;