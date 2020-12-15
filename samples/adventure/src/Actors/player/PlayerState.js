import { exposeOnWindow } from "../../../../../src/utils/Helper.js";
import UISystem from "../../ui/UISystem.js";
import Stats from "../Stats.js";

const _stats = new Stats(function() {
	UISystem.updatePlayerStats(_stats);
});
_stats.hp_max = 10;
_stats.hp = 10;
_stats.atk = 3;
_stats.def = 2;


/**
 * A singleton to store all player information.
 * e.g. stats like health or the inventory.
 */
const PlayerState = {
	inventory: null,
	stats: _stats
};

export default PlayerState;

exposeOnWindow("playerState", PlayerState);