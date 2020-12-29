// JMP Engine imports
import { fail } from "../../../../../src/utils/Log.js";
import EventBus from "../../../../../src/utils/EventBus.js";

// Adventure Engine imports
import IconsPool from "./IconsPool.js";
import Constants from "../../Constants.js";

/**
 * Creates a DOM-String for rendering a single Backpack-Entry.
 *
 * @param {object} itemInfo
 * @param {int} itemInfo.amount the amount which is carried
 * @param {ItemType} itemInfo.type the ItemType which is carried
 */
function renderEntry(itemInfo) {
	let entryDOM = document.createElement("div");
	entryDOM.classList.add("adv_backpack_entry");
	entryDOM.setAttribute("draggable", true);

	entryDOM.innerHTML = `
<div class="amount column">
	<div>${itemInfo.amount}x</div>
</div>
<div class="icon column">
	${IconsPool.getIconDOM("items", itemInfo.type.sprite)}
</div>
<div class="itemName column">
	<div>${itemInfo.type.text.name}</div>
</div>
<div class="actionButtons column">
	<div>[Use]</div>
</div>
	`;

	return entryDOM;
}

/**
 * Handling of a dragstart operation.
 *
 * @param {ItemType} itemType the dragged backpack ItemType
 * @param {object} event DOM Event for 'dragstart'
 */
function dragstartHandler(itemType, event) {
	event.dataTransfer.effectAllowed = "move";
	// we only need the item types id to process the dragging from/to the backpack
	event.dataTransfer.setData("text/plain", itemType.id);
}

/**
 * The BackpackController handles:
 * - the Rendering of Backpack content
 * - the interactions for Backpack entries.
 */
const BackpackController = {
	_containerDOM: null,

	/**
	 * Initialize the BackpackController,
	 * @param {Element} containerDOM the container DOM element into which the Backpack will be rendered
	 */
	init(containerDOM) {
		this._containerDOM = containerDOM;

		EventBus.subscribe(Constants.Events.UPDATE_BACKPACK, this.updateBackpack.bind(this));
		EventBus.subscribe(Constants.Events.UPDATE_EQUIPMENT, this.updateEquipment.bind(this));
	},

	/**
	 * Called on each Backpack change.
	 * @param {object} evt contains the Backpack instance in its data property
	 */
	updateBackpack(evt) {
		let backpack = evt.data.backpack;
		this.renderBackpackContent(backpack);
	},

	/**
	 * Called on each Equipment update.
	 * @param {object} evt contains the equipment change information
	 */
	updateEquipment(evt) {
		fail("not implemented yet", evt.data);
	},

	/**
	 * Renders the given Backpack and its items into the given container DOM Element.
	 *
	 * @param {Backpack} backpack the backpack that should be rendered
	 * @param {Element} container DOM Element into which the Backpack content should be rendered
	 */
	renderBackpackContent(backpack) {
		let allItemsByCategory = backpack.getAllItemsByCategory();
		let itemsCount = 0;

		// clear container, I know... not the most elegant solution but good enough for our game ;)
		this._containerDOM.innerHTML = "";

		// create new entries
		for (let catName in allItemsByCategory) {
			let category = allItemsByCategory[catName];
			for (let itemID in category) {
				let itemInfo = category[itemID];
				let entryDOM = renderEntry(itemInfo);

				// connect Drag Handlers
				entryDOM.addEventListener("dragstart", dragstartHandler.bind(entryDOM, itemInfo.type));

				this._containerDOM.appendChild(entryDOM);
				itemsCount++;
			}
		}

		// It can happen that the player drops or consumes all items
		if (!itemsCount) {
			this._containerDOM.innerHTML = "<div class='adv_backpack_entry'>Your backpack is empty.</div>";
		}
	}
}

export default BackpackController;