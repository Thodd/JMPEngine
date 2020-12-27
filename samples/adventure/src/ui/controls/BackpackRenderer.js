import IconsPool from "./IconsPool.js";

/**
 * Creates a DOM-String for rendering a single Backpack-Entry.
 *
 * @param {object} itemInfo
 * @param {int} itemInfo.amount the amount which is carried
 * @param {ItemType} itemInfo.type the ItemType which is carried
 */
function renderEntry(itemInfo) {
	let pattern = `
<div class="adv_backpack_entry">
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
		<div>[A] [B] [C]</div>
	</div>
</div>
	`;
	return pattern;
}

const BackpackRenderer = {
	/**
	 * Renders the given Backpack and its items into the given container DOM Element.
	 *
	 * @param {Backpack} backpack the backpack that should be rendered
	 * @param {Element} container DOM Element into which the Backpack content should be rendered
	 */
	renderBackpackContent(backpack, container) {
		let allItemsByCategory = backpack.getAllItemsByCategory();
		let allItemsDOM = "";

		for (let catName in allItemsByCategory) {
			let category = allItemsByCategory[catName];
			for (let itemID in category) {
				let itemInfo = category[itemID];
				allItemsDOM += renderEntry(itemInfo);
			}
		}

		container.innerHTML = allItemsDOM;
	}
}

export default BackpackRenderer;