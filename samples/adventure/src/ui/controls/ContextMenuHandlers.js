import { log } from "../../../../../src/utils/Log.js";
import EventBus from "../../../../../src/utils/EventBus.js";
import Constants from "../../Constants.js";

/**
 * Implements reusable click handlers for Item ContextMenus.
 * Thin layer to fire the events from UI to LOGIC.
 */
const MenuHandlerImplementations = {
	lookAt(itemType) {
		log(`looking at item: '${itemType.id}'`, "ContextMenu");
		EventBus.publish(Constants.Events.UI_UPDATE_BACKPACK, {
			changeType: "look",
			changedItem: itemType
		});
	},
	equip(itemType, slot) {
		log(`equipping item '${itemType.id}' in slot '${slot}'`, "ContextMenu");
		EventBus.publish(Constants.Events.UI_UPDATE_BACKPACK, {
			changeType: "equip",
			changedItem: itemType,
			changedSlot: slot
		});
	},
	unequip(slot) {
		log(`unequipping item from slot '${slot}'`, "ContextMenu");
		EventBus.publish(Constants.Events.UI_UPDATE_BACKPACK, {
			changeType: "unequip",
			changedSlot: slot
		});
	},
	consume(itemType) {
		log(`consuming item '${itemType.id}'`, "ContextMenu");
		EventBus.publish(Constants.Events.UI_UPDATE_BACKPACK, {
			changeType: "consume",
			changedItem: itemType
		});
	}
};

export default MenuHandlerImplementations;