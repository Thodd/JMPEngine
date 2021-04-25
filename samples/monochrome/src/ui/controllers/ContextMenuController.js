// jmp engine imports
import EventBus from "../../../../../src/utils/EventBus.js";

// ui layer imports
import ContextMenuHandlers from "../controls/ContextMenuHandlers.js";

// game logic imports
import PlayerState from "../../actors/player/PlayerState.js";
import ItemTypes from "../../items/ItemTypes.js";
import Constants from "../../Constants.js";

let _outerDOM;
let _titleDOM;
let _contentDOM;

/**
 * Renders the content of the context menu
 */
function renderMenuContent(title, entries) {
	// clear content
	// TODO: deregister Event-Handlers
	_contentDOM.innerHTML = "";

	_titleDOM.textContent = title;

	entries.forEach(function(entry) {
		let entryDOM = document.createElement("div");
		entryDOM.classList.add("contextMenuEntry");

		entryDOM.innerHTML = `<span>${entry.text}</span>`;

		entryDOM.addEventListener("click", function() {
			entry.callback();
			// force close of context-menu after an entry was clicked
			ContextMenuController.close();
		});

		_contentDOM.appendChild(entryDOM);
	});
}

const ContextMenuController = {
	init(dom) {
		_outerDOM = dom;
		_titleDOM = dom.getElementsByClassName("wnd_title")[0];
		_contentDOM = dom.getElementsByClassName("wnd_content")[0];
		_contentDOM.innerHTML = "<div>test</div><div>test2</div>";

		// close a context menu if we register a click outside the menu
		document.addEventListener("click", function(evt) {
			if (!_outerDOM.contains(evt.target)) {
				this.close();
			}
		}.bind(this));

		// prevent default context menu of the browser
		// document.addEventListener("contextmenu", function(evt) {
		// 	evt.preventDefault();
		// })

		EventBus.subscribe(Constants.Events.LOGIC_PLAYER_TURN_ENDED, this.close.bind(this));
	},

	/**
	 * Forces a close of the context-menu.
	 */
	close() {
		_outerDOM.classList.add("hidden");
	},

	/**
	 * Dynamically creates the content of the context menu for the given ItemType.
	 * @param {ItemType} itemType the item type for which the context-menu entries will be created
	 * @param {string} context the context from which the context-menu opens up: "equipment" or "backpack"
	 * @param {string} [currentSlot] optionally the slot name if the menu is opened on an equipment slot
	 */
	createDynamicEntriesForItem(itemType, context, currentSlot) {
		let backpack = PlayerState.backpack;

		// default entry is looking
		let entries = [{text: "Look at", callback: ContextMenuHandlers.lookAt.bind(this, itemType, context, currentSlot)}];

		// one entry for each equippable slot
		for (let newSlot of itemType.equippableAs) {
			// check the currently equipped item in the player's backpack
			// so we can exclude the entries which are unnecessary
			if (backpack.getItemFromSlot(newSlot) != itemType) {
				entries.push({
					text: `Equip as '${newSlot}'`,
					callback: ContextMenuHandlers.equip.bind(this, itemType, context, newSlot, currentSlot)
				});
			}
		}

		// consumables
		if (itemType.category == ItemTypes.Categories.CONSUMABLE) {
			entries.push({
				text: "Consume",
				callback: ContextMenuHandlers.consume.bind(this, itemType, context, currentSlot)
			});
		}

		return entries;
	},

	/**
	 * Creates a context-menu for the given DOM Element.
	 * Creates a default set of entries based on the given item type.
	 *
	 * @param {Element} entryDOM the dom element which should have a context-menu
	 * @param {ItemType} itemInfo the itemType which is associated with this context-menu
	 * @param {string} context the context from which the context-menu opens up: "equipment" or "backpack"
	 * @param {string} [slotName] optionally the slot name if the menu is opened on an equipment slot
	 */
	createContextMenuForItem(entryDOM, itemType, context, slotName) {
		ContextMenuController.connect({
			dom: entryDOM,
			title: `${itemType.text.name}`,
			createContent: this.createDynamicEntriesForItem.bind(entryDOM, itemType, context, slotName)
		});
	},

	/**
	 * Connects a given DOM Element with a context menu.
	 * The entries which are shown are based on the given context information.
	 *
	 * @param {Element} domElement the DOM Element to which a context menu should be attached
	 * @param {object} contextInfo information for rendering and wiring the context menu entries
	 */
	connect(contextInfo) {
		let domElement = contextInfo.dom;

		domElement.addEventListener("contextmenu", function(evt) {
			// make sure no other listeners interfere with the context-menu
			evt.preventDefault();
			evt.stopPropagation();

			// show and position the context-menu
			_outerDOM.classList.remove("hidden");
			_outerDOM.style.left = `${evt.pageX}px`;
			_outerDOM.style.top = `${evt.pageY}px`;

			// dynamically create content if needed
			let content;
			if (contextInfo.createContent) {
				content = contextInfo.createContent();
			}

			renderMenuContent(contextInfo.title, content || contextInfo.entries);
		});
	}
}

export default ContextMenuController;