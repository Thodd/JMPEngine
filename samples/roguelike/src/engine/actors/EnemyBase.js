import { log } from "../../../../../src/utils/Log.js";
import ActorBase from "./ActorBase.js";

class EnemyBase extends ActorBase {
	takeTurn() {
		if (this.isStandingAdjacent(this.getPlayerActor())) {
			log("attack.", "EnemyBase");
		} else {
			this.makeRandomMove();
		}
		// this.moveTowardsActor(this.getPlayerActor());
	}
}

export default EnemyBase;