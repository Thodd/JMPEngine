// JMP Engine imports
import EventBus from "../../../../../src/utils/EventBus.js";

// Adventure Engine imports
import ContextMenuController from "./ContextMenuController.js";

import IconsPool from "../controls/IconsPool.js";
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

	entryDOM.setAttribute("data-adv-context", "backpack");

	entryDOM.innerHTML = `
<div class="amount column">
	<div>${itemInfo.amount > 0 ? itemInfo.amount + 'x' : ''}</div>
</div>
<div class="icon column">
	${IconsPool.getIconDOM("items", itemInfo.type.sprite)}
</div>
<div class="itemName column">
	<div>${itemInfo.type.text.name}</div>
</div>
	`;

	return entryDOM;
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

		EventBus.subscribe(Constants.Events.LOGIC_UPDATE_BACKPACK, this.updateBackpack.bind(this));
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
	 * Renders the given Backpack and its items into the given container DOM Element.
	 *
	 * @param {Backpack} backpack the backpack that should be rendered
	 * @param {Element} container DOM Element into which the Backpack content should be rendered
	 */
	renderBackpackContent(backpack) {
		let allItemsByCategory = backpack.getAllItemsByCategory();
		let itemsCount = 0;

		// clear container, I know... not the most elegant solution but good enough for our game ;)
		// TODO: deregister event handlers ???   -->   ContextMenuController.deconnect(...)
		this._containerDOM.innerHTML = "";

		// create new entries
		for (let catName in allItemsByCategory) {
			let category = allItemsByCategory[catName];
			for (let itemID in category) {
				let itemInfo = category[itemID];
				let entryDOM = renderEntry(itemInfo);

				// connect Contextmenu
				ContextMenuController.createContextMenuForItem(entryDOM, itemInfo.type);

				this._containerDOM.appendChild(entryDOM);
				itemsCount++;
			}
		}

		// It can happen that the players backpack is empty, e.g. if all items are consumed
		if (!itemsCount) {
			this._containerDOM.appendChild(renderEntry({
				amount: 0,
				type: {
					sprite: 81,
					text: {
						name: "Your backpack is empty."
					}
				}
			}))
		}
	}
}

export default BackpackController;