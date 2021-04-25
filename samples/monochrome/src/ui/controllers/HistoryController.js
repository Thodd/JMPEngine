/**
 * History & Logging
 */
// number of max messages (keep the dom small)
let maxMsgs = 100;

// track the last message type
let lastMsgWasEven = true;

// dom reference into which the history lines will be inserted
let historyDOM;

const api = {
	init(domContainer) {
		historyDOM = domContainer;
	},

	log(msg) {
		// reuse existing DOM elements
		maxMsgs--;
		let newMsg;
		if (maxMsgs < 0) {
			newMsg = historyDOM.firstElementChild;
			historyDOM.removeChild(newMsg);
		} else {
			newMsg = document.createElement("p");
		}

		// add new msg and color row accordingly
		newMsg.className = lastMsgWasEven ? "odd" : "even";
		lastMsgWasEven = !lastMsgWasEven;
		newMsg.innerHTML = msg;
		historyDOM.appendChild(newMsg);

		// scroll down
		historyDOM.scrollTop = historyDOM.scrollHeight;
	},

	clear() {

	}
};

export default api;