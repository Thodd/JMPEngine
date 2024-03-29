// JMP Engine imports
import { exposeOnWindow } from "../../../../src/utils/Helper.js";

// Adventure Engine imports
import ContextMenuController from "./controllers/ContextMenuController.js";
import HistoryController from "./controllers/HistoryController.js";
import StatsController from "./controllers/StatsController.js";
import BackpackController from "./controllers/BackpackController.js";
import EquipmentController from "./controllers/EquipmentController.js";
import IconsPool from "./controls/IconsPool.js";

// container DOM elements
// DOM can be accessed, since the game is started only after the loaded event
const _dom = {
	stats:        document.getElementById("adv_stats"),
	hp:           document.getElementById("adv_stats_hp"),
	contextMenu:  document.getElementById("adv_contextMenu"),
	history:      document.querySelector("#adv_history .wnd_content"),
	backpack:     document.querySelector("#adv_backpack .wnd_content"),
	equipment: {
		melee:    document.getElementById("adv_equipment_melee_slot"),
		ranged:   document.getElementById("adv_equipment_ranged_slot"),
		quickA:   document.getElementById("adv_equipment_quick_slot_A"),
		quickS:   document.getElementById("adv_equipment_quick_slot_S")
	}
};

// simple History logging API
const _api = {
	log: HistoryController.log
};

// initialize controllers
ContextMenuController.init(_dom.contextMenu);
HistoryController.init(_dom.history);
StatsController.init(_dom.hp);
BackpackController.init(_dom.backpack);
EquipmentController.init(_dom.equipment);


/**
 * custom mouse cursor
 * TODO: Move to own module
 * TODO: initialize after Spritesheet is available
 */
// let cursorDOM = document.createElement("div");
// cursorDOM.innerHTML = IconsPool.getIconDOM("items", 47, 2);
// cursorDOM.style.position = "fixed";
// cursorDOM.style.transform = "rotate(-90deg)";

// document.body.appendChild(cursorDOM);

// document.addEventListener("mousemove", function(evt) {
// 	evt.preventDefault();
// 	cursorDOM.style.left = `${evt.clientX+2}px`;
// 	cursorDOM.style.top = `${evt.clientY+2}px`;
// });

exposeOnWindow("UISystem", _api);

export default _api;