import { log } from "../../../../../src/utils/Log.js";

/**
 * Implements the click handlers for Item ContextMenus.
 */
const MenuHandlerImplementations = {
	lookAt(itemType) {
		log(`looking at item: '${itemType.id}'`, "ContextMenu");
	},
	equip(itemType, slot) {
		log(`equipping item '${itemType.id}' in slot '${slot}'`, "ContextMenu");
	},
	unequip(slot) {
		log(`unequippin item from slot '${slot}'`, "ContextMenu");
	},
	consume(itemType) {
		log(`consuming item '${itemType.id}'`, "ContextMenu");
	}
};

export default MenuHandlerImplementations;