// jmp engine imports
import EventBus from "../../../../../src/utils/EventBus.js";
import { exposeOnWindow } from "../../../../../src/utils/Helper.js";

// ui imports
import IconsPool from "../controls/IconsPool.js";
import ContextMenuController from "./ContextMenuController.js";

// game logic imports
import Constants from "../../Constants.js";

let _domElements;

/**
 * Re-Renders an euqipment slot on change.
 * Also connects event handlers for context menu.
 *
 * @param {object} evt jmp Event object
 */
function renderEquipmentSlots(evt) {
	// Event Data consists of:
	// changeType
	// changedItem
	// changedSlot
	// backpack
	let evtData = evt.data;

	if (evtData.changeType == "equip") {
		let slotDom = _domElements[evtData.changedSlot];

		// TODO: Render Equipment content into slot
		slotDom.innerHTML = IconsPool.getIconDOM("items", evtData.changedItem.sprite, 4);

		// connect Contextmenu
		ContextMenuController.createContextMenuForItem(slotDom, evtData.changedItem);

	} else if (evtData.changeType == "unequip") {
		// TODO: remove event handlers and empty the display
		let slotDom = _domElements[evtData.changedSlot];
		slotDom.innerHTML = "";
	}
}


/**
 * The EquipmentController handles:
 * - Rendering of the currently equipped items
 * - interactions on the equipment slots, e.g. equipping, unequipping, using, ...
 */
const EquipmentController = {
	/**
	 * Initialize the EquipmentController,
	 * @param {Element} containerDOM the container DOM element into which the Equipment will be rendered
	 */
	init(domElements) {
		_domElements = domElements;

		EventBus.subscribe(Constants.Events.UPDATE_BACKPACK, renderEquipmentSlots);
	}
};

exposeOnWindow("EquipmentController", EquipmentController);

export default EquipmentController;