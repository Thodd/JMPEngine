// JMP Engine imports
import { exposeOnWindow } from "../../../../src/utils/Helper.js";

// Adventure Engine imports
import ContextMenuController from "./controls/ContextMenuController.js";
import HistoryController from "./controls/HistoryController.js";
import StatsController from "./controls/StatsController.js";
import BackpackController from "./controls/BackpackController.js";
import EquipmentController from "./controls/EquipmentController.js";

// container DOM elements
// DOM can be accessed, since the game is started only after the loaded event
const _dom = {
	stats:        document.getElementById("adv_stats"),
	hp:           document.getElementById("adv_stats_hp"),
	contextMenu:  document.getElementById("adv_contextMenu"),
	history:      document.querySelector("#adv_history .wnd_content"),
	backpack:     document.querySelector("#adv_backpack .wnd_content"),
	equipment: {
		melee:       document.getElementById("adv_equipment_melee_slot"),
		ranged:      document.getElementById("adv_equipment_ranged_slot"),
		quickSlot1:  document.getElementById("adv_equipment_quick_slot_1"),
		quickSlot2:  document.getElementById("adv_equipment_quick_slot_2")
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

exposeOnWindow("UISystem", _api);

export default _api;