import ItemTypes from "../../items/ItemTypes.js";
import IconsPool from "../controls/IconsPool.js";
import PlayerState from "../../actors/player/PlayerState.js";
import { exposeOnWindow } from "../../../../../src/utils/Helper.js";

let _domElements;

// we track the dragged item type manually, since the DOM API
// is pretty restrictive when accessing "transferData"...
let _currentDraggedItemType;

// the drag-origin is either:
// - "backpack"
// - "equipment"
let _currentDragOrigin;

/**
 * Helper functions for accessing Event stuff.
 */
function getSlotName(dom) {
	if (dom instanceof Event) {
		dom = dom.target;
	}
	return dom.dataset.advSlot;
}

function getDragOrigin(dom) {
	if (dom instanceof Event) {
		dom = dom.target;
	}
	return dom.dataset.advDragOrigin;
}

/**
 * Clean up after any drag-operation has ended:
 * - successful
 * - failed
 * - canceled
 */
function cleanUp() {
	_currentDraggedItemType = null;
	_currentDragOrigin = null;

	for (let s in _domElements) {
		_domElements[s].classList.remove("hoverDropzone");
	}
}


/**
 * DOM Handlers --> forward to game-logic checks
 */

/**
 * Handling of a dragstart operation.
 *
 * @param {ItemType} itemType the dragged backpack ItemType
 * @param {object} event DOM Event for 'dragstart'
 */
function dragstart(dragOrigin, itemType, evt) {
	evt.dataTransfer.effectAllowed = "move";

	_currentDraggedItemType = itemType;
	_currentDragOrigin = dragOrigin;
}

function dragend(evt) {
	// evt.target == the original dragged item (no matter from what origin)
	cleanUp();
}

/**
 * Called when a drop-zone is entered.
 * @param {Event} evt native dragenter Event
 */
function dragenter(evt) {}

/**
 * Removes any visual effects when a drop-zone is left.
 * @param {Event} evt native dragleave Event
 */
function dragleave(evt) {
	this.classList.remove("hoverDropzone");
}

/**
 * Necessary for dropping stuff.
 * Standard native boilerplate.
 * @param {Event} evt native dragover Event
 */
function dragover(evt) {
	let targetDragOrigin = getDragOrigin(evt);

	if (_currentDragOrigin == "backpack") {
		// dragging from "backpack" to "equipment" --> equip
		if (targetDragOrigin == "equipment") {
			let slotName = getSlotName(evt);
			if (_currentDraggedItemType.isEquippableAs(slotName)) {
				this.classList.add("hoverDropzone");
				if (evt.preventDefault) {
					evt.preventDefault();
				}
				return false;
			}
		} else if (targetDragOrigin == "backpack") {
			// dragging from "backpack" to "backpack" does nothing right now
			return;
		}
	} else if (_currentDragOrigin == "equipment") {
		// dragging from "equipment" to "backpack" --> unequip
		if (targetDragOrigin == "backpack") {
			// TODO: implement
		} else if (targetDragOrigin == "equipment") {
			// dragging from "equipment" to "equipment" --> swap place
			// TODO: implement item swapping from one slot to another
			return;
		}
	}
}



function drop(evt) {
	//evt.preventDefault();
	this.classList.remove('hoverDropzone');
	cleanUp();
}


/**
 * Game Logic handlers
 */



/**
 * The EquipmentController handles:
 * - Rendering of the currently equipped items
 * - interactions on the equipment slots, e.g. equipping, unequipping, using, ...
 */
const EquipmentController = {
	/**
	 * Connects the given DOM element with a dragstart event.
	 */
	connectDraggableHandlers(dom, itemType) {
		let dragOrigin = getDragOrigin(dom);
		dom.addEventListener("dragstart", dragstart.bind(dom, dragOrigin, itemType));
		dom.addEventListener("dragend", dragend.bind(dom, dragOrigin, itemType));
	},

	/**
	 * Debugging function to see which item is currently dragged.
	 */
	_getCurrentDraggedItemType() {
		return _currentDraggedItemType;
	},

	/**
	 * Initialize the EquipmentController,
	 * @param {Element} containerDOM the container DOM element into which the Equipment will be rendered
	 */
	init(domElements) {
		_domElements = domElements;

		for (let slot in _domElements) {
			let slotDom = _domElements[slot];

			slotDom.addEventListener("dragover", dragover);
			slotDom.addEventListener("dragenter", dragenter);
			slotDom.addEventListener("dragleave", dragleave);
			slotDom.addEventListener("drop", drop);
		}
	}
}

exposeOnWindow("EquipmentController", EquipmentController);

export default EquipmentController;