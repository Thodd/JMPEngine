// engine imports
import { char2id } from "../../../engine/utils/RLTools.js";
import EnemyBase from "../../../engine/actors/EnemyBase.js";

// gamecontent imports
import Colors from "../../Colors.js";
import Weapons from "../../items/Weapons.js";

// stat definitions
const def = {
	visuals: {
		id: char2id("r"),
		color: Colors[7]
	},
	stats: {
		hp: 2,
		speed: 75,
	},
	weapon: Weapons.TEETH
};

class Rat extends EnemyBase {
	constructor() {
		super(def);
	}

	takeTurn() {
		if (this.isStandingAdjacent(this.getPlayerActor())) {
			this.meleeAttackActor(this.getPlayerActor());
		} else {
			this.makeRandomMove();
		}
		// this.moveTowardsActor(this.getPlayerActor());
	}
}

export default Rat;