// engine imports
import { char2id } from "../../../engine/utils/RLTools.js";
import EnemyBase from "../../../engine/actors/EnemyBase.js";

// gamecontent imports
import Colors from "../../Colors.js";
import Weapons from "../../items/Weapons.js";

// stat definitions
const def = {
	visuals: {
		id: char2id("d"),
		color: Colors[7]
	},
	stats: {
		hp: 3,
		speed: 100,
	},
	weapon: Weapons.FANGS
};

class RabidDog extends EnemyBase {
	constructor() {
		super(def);
	}

	takeTurn() {
		// TODO: dog AI
	}
}

export default RabidDog;