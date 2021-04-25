import { log } from "../../../../../src/utils/Log.js";
import EventBus from "../../../../../src/utils/EventBus.js";
import Constants from "../../Constants.js";

/**
 * Implements reusable click handlers for Item ContextMenus.
 * Thin layer to fire the events from UI to LOGIC.
 */
const MenuHandlerImplementations = {
	lookAt(itemType, context, slot) {
		log(`looking at item: '${itemType.id}'`, "ContextMenu");
		EventBus.publish(Constants.Events.UI_UPDATE_BACKPACK, {
			changeType: "look",
			changedItem: itemType,
			context: context
		});
	},
	equip(itemType, context, newSlot, currentSlot) {
		log(`equipping item '${itemType.id}' in slot '${newSlot}'`, "ContextMenu");
		EventBus.publish(Constants.Events.UI_UPDATE_BACKPACK, {
			changeType: "equip",
			changedItem: itemType,
			context: context,
			newSlot: newSlot,
			currentSlot: currentSlot
		});
	},
	consume(itemType, context, slot) {
		log(`consuming item '${itemType.id}'`, "ContextMenu");
		EventBus.publish(Constants.Events.UI_UPDATE_BACKPACK, {
			changeType: "consume",
			changedItem: itemType,
			context: context,
			currentSlot: slot
		});
	}
};

export default MenuHandlerImplementations;