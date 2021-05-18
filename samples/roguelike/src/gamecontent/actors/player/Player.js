// engine imports
import { char2id } from "../../../engine/utils/RLTools.js";
import ActorBase from "../../../engine/actors/ActorBase.js";

// gamecontent imports
import Colors from "../../Colors.js";

// own stuff
import PlayerState from "./PlayerState.js";

class Player extends ActorBase {
	constructor() {
		super();

		this.id = char2id("@");
		this.color = Colors[0];
	}

	/**
	 * Player starts without a weapon initially!
	 */
	equipInitialWeapon() {}

	/**
	 * Returns the static player backpack.
	 * The player's backpack is a singleton which is persistent across all
	 * maps/screens.
	 * @returns {Backpack} the players backpack
	 */
	getBackpack() {
		return PlayerState.getBackpack();
	}

	/**
	 * Returns the static player Stats value object.
	 * The player's stat values are a singleton and persistent across all
	 * maps/screens.
	 * @returns {Stats} the players stat value object
	 */
	getStats() {
		return PlayerState.getStats();
	}
}

export default Player;