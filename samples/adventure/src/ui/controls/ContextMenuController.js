import PlayerState from "../../actors/player/PlayerState.js";
import Constants from "../../Constants.js";
import ItemTypes from "../../items/ItemTypes.js";
import IconsPool from "./IconsPool.js";

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

		entryDOM.addEventListener("click", entry.callback);

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
				_outerDOM.classList.add("hidden");
			}
		});

		// prevent default context menu of the browser
		// document.addEventListener("contextmenu", function(evt) {
		// 	evt.preventDefault();
		// })
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

			renderMenuContent(contextInfo.title, contextInfo.entries);
		});
	}
}

export default ContextMenuController;