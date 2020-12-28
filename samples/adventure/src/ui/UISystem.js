import { exposeOnWindow } from "../../../../src/utils/Helper.js";
import EventBus from "../../../../src/utils/EventBus.js";

import Constants from "../Constants.js";

import BackpackRenderer from "./controls/BackpackRenderer.js";
import Bar from "./controls/Bar.js";

// container DOM elements
// DOM can be accessed, since the game is started only after the loaded event
const _dom = {
	stats:    document.getElementById("adv_stats"),
	hp:       document.getElementById("adv_stats_hp"),
	history:  document.querySelector("#adv_history .wnd_content"),
	backpack: document.querySelector("#adv_backpack .wnd_content")
};


const playerHealthBar = new Bar();
_dom.hp.appendChild(playerHealthBar.getDom());


// number of max messages (keep the dom small)
let maxMsgs = 100;

// track the last message type
let _lastMsgWasEven = true;

function log(msg) {
	// reuse existing DOM elements
	maxMsgs--;
	let newMsg;
	if (maxMsgs < 0) {
		newMsg = _dom.history.firstElementChild;
		_dom.history.removeChild(newMsg);
	} else {
		newMsg = document.createElement("p");
	}

	// add new msg and color row accordingly
	newMsg.className = _lastMsgWasEven ? "odd" : "even";
	_lastMsgWasEven = !_lastMsgWasEven;
	newMsg.innerHTML = msg;
	_dom.history.appendChild(newMsg);

	// scroll down
	_dom.history.scrollTop = _dom.history.scrollHeight;
}


/**
 * Called on stat change by the Player(State).
 * @param {Stats} stats the Stats instance of the player
 */
function updatePlayerStats(evt) {
	let stats = evt.data;
	playerHealthBar.setMaxValue(stats.hp_max);
	playerHealthBar.setValue(stats.hp);
}

/**
 * Called on each Backpack change.
 * @param {object} evt contains the Backpack instance in its data property
 */
function updateBackpack(evt) {
	let backpack = evt.data.backpack;
	BackpackRenderer.renderBackpackContent(backpack, _dom.backpack);
}

// Subscribe to global Events which trigger a UI update
EventBus.subscribe(Constants.Events.UPDATE_STATS, updatePlayerStats);
EventBus.subscribe(Constants.Events.UPDATE_BACKPACK, updateBackpack);

const _api = {
	log: log
};

exposeOnWindow("UISystem", _api);

export default _api;