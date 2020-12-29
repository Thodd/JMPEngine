import EventBus from "../../../../../src/utils/EventBus.js";

import Constants from "../../Constants.js";
import Bar from "./Bar.js";

/**
 * Renders and updates the Player Stats on change.
 */
const StatsController = {
	_playerHealthBar: null,

	/**
	 * Initialize the StatsController,
	 * @param {Element} containerDOM the container DOM element into which the Stats will be rendered
	 */
	init(containerDOM) {
		this._containerDOM = containerDOM;

		// create HP Bar control
		this._playerHealthBar = new Bar();
		this._containerDOM.appendChild(this._playerHealthBar.getDom());

		// Subscribe to global Events which trigger a UI update
		EventBus.subscribe(Constants.Events.UPDATE_STATS, this.updatePlayerStats.bind(this));
	},

	/**
	 * Called on stat change by the Player(State).
	 * @param {Stats} stats the Stats instance of the player
	 */
	updatePlayerStats(evt) {
		let stats = evt.data;
		this._playerHealthBar.setMaxValue(stats.hp_max);
		this._playerHealthBar.setValue(stats.hp);
	}
};

export default StatsController;