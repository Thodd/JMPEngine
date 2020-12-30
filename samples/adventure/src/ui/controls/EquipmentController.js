import EventBus from "../../../../../src/utils/EventBus.js";

import ItemTypes from "../../items/ItemTypes.js";
import IconsPool from "../controls/IconsPool.js";

import ContextMenuController from "./ContextMenuController.js";

import { exposeOnWindow } from "../../../../../src/utils/Helper.js";
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
		slotDom.innerHTML = IconsPool.getIconDOM("items", evtData.changedItem.sprite);

		// connect Contextmenu
		ContextMenuController.connect({
			dom: slotDom,
			title: `${evtData.changedItem.text.name}`,
			entries: [
				{text: "Look at", callback: function() {console.log("test");}},
				{text: "Unequip", callback: function() {}},
				{text: "Equip as Ranged", callback: function() {}},
				{text: "Equip in Quick-Slot 1", callback: function() {}},
				{text: "Equip in Quick-Slot 2", callback: function() {}},
				{text: "Consume", callback: function() {}}
			]
		});
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


}

exposeOnWindow("EquipmentController", EquipmentController);

export default EquipmentController;