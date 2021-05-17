import EnemyBase from "../../../engine/actors/EnemyBase.js";
import { char2id } from "../../../engine/utils/RLTools.js";
import Colors from "../../../engine/Colors.js";
class Snake extends EnemyBase {
	constructor() {
		super();

		this.id = char2id("s");
		this.color = Colors[7];
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

export default Snake;