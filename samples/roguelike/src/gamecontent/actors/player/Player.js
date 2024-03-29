// engine imports
import { char2id } from "../../../engine/utils/RLTools.js";
import ActorBase from "../../../engine/actors/ActorBase.js";
import EquipmentSlots from "../../../engine/inventory/EquipmentSlots.js";

// gamecontent imports
import Colors from "../../Colors.js";
import Weapons from "../../items/Weapons.js";

// own imports
import PlayerState from "./PlayerState.js";

class Player extends ActorBase {
	constructor() {
		super({
			visuals: {
				id: char2id("@"),
				color: Colors[0]
			}
		});

		// helps to distinguish the
		this.isPlayer = true;
	}

	/**
	 * @override
	 */
	defineStats() {
		let stats = this.getStats();
		stats.hp_max = 10;
		stats.hp = 10;
	}

	/**
	 * @override
	 */
	equipInitialWeapon() {
		let bp = this.getBackpack();
		bp.addItem(Weapons.POCKET_KNIFE);
		bp.equipItem(Weapons.POCKET_KNIFE, EquipmentSlots.MELEE);
	}

	/**
	 * Returns the static player backpack.
	 * The player's backpack is a singleton which is persistent across all
	 * maps/screens.
	 * @returns {Backpack} the players backpack
	 * @override
	 */
	getBackpack() {
		return PlayerState.getBackpack();
	}

	/**
	 * Returns the static player Stats value object.
	 * The player's stat values are a singleton and persistent across all
	 * maps/screens.
	 * @returns {Stats} the players stat value object
	 * @override
	 */
	getStats() {
		return PlayerState.getStats();
	}

}

export default Player;