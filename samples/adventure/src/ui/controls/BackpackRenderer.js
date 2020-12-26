import PlayerState from "../../actors/player/PlayerState.js";

function renderEntry(itemInfo) {
	let pattern = `
<div class="adv_backpack_entry">
	<div class="amount column">
		<div>${itemInfo.amount}</div>
	</div>
	<div class="icon column">
		<div>&hearts;</div>
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
	render(container) {
		let allItemsByCategory = PlayerState.backpack.getAllItemsByCategory();
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