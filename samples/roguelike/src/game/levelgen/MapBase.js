import RLMap from "../../core/RLMap.js";

import RLActor from "../../core/RLActor.js";
import { char2id } from "../../utils/RLHelper.js";
import Colors from "../../Colors.js";

/**
 * Base class for all Maps of the game.
 * Extends RLMap and provides hooks to structure the Map generation lifecycle.
 */
class MapBase extends RLMap {
	constructor(spec) {
		super(spec);

		// setup default player actor (can be overwritten or changed if needed)
		this._playerActor = new RLActor();
		this._playerActor.id = char2id("@");
		this._playerActor.color = Colors[0];

		this._generate();
		this._populate();
		this._placePlayer();
	}

	/**
	 * Returns the default player RLActor instance.
	 * @returns {RLActor} the player actor
	 */
	getPlayerActor() {
		return this._playerActor;
	}

	/**
	 * Hook to generate a map.
	 */
	_generate() {}

	/**
	 * Hook to populate the generated map with NPCs.
	 */
	_populate() {}

	/**
	 * Hook to place the player RLActor instance in the map.
	 * Can also be used to change the player RLActor instance to something else.
	 * Or simply use getPlayerActor() to retrieve the default instance.
	 */
	_placePlayer() {}
}

export default MapBase;