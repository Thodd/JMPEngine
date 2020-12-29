// JMP Engine imports
import { exposeOnWindow } from "../../../../src/utils/Helper.js";

// Adventure Engine imports
import StatsController from "./controls/StatsController.js";
import BackpackController from "./controls/BackpackController.js";
import EquipmentController from "./controls/EquipmentController.js";

// container DOM elements
// DOM can be accessed, since the game is started only after the loaded event
const _dom = {
	stats:     document.getElementById("adv_stats"),
	hp:        document.getElementById("adv_stats_hp"),
	history:   document.querySelector("#adv_history .wnd_content"),
	backpack:  document.querySelector("#adv_backpack .wnd_content"),
	equipment: {
		melee: document.getElementById("#adv_equipment_melee_slot"),
		ranged: document.getElementById("#adv_equipment_ranged_slot"),
		quickSlot1: document.getElementById("#adv_equipment_quick_slot_1"),
		quickSlot2: document.getElementById("#adv_equipment_quick_slot_2")
	}
};


/**
 * History & Logging
 */
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

// simple History logging API
const _api = {
	log: log
};

// initialize controllers
StatsController.init(_dom.hp);
BackpackController.init(_dom.backpack);
EquipmentController.init(_dom.equipment);

exposeOnWindow("UISystem", _api);

export default _api;