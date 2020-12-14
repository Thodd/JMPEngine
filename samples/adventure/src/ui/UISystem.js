const _dom = {};

function init() {
	_dom.stats = document.getElementById("adv_stats");
	_dom.log = document.querySelector("#adv_log .wnd_content");
}

// number of max messages (keep the dom small)
let maxMsgs = 100;

// track the last message type
let _lastMsgWasEven = true;

function log(msg) {
	// reuse existing DOM elements
	maxMsgs--;
	let newMsg;
	if (maxMsgs < 0) {
		newMsg = _dom.log.firstElementChild;
	} else {
		newMsg = document.createElement("p");
	}

	// add new msg and color row accordingly
	newMsg.className = _lastMsgWasEven ? "odd" : "even";
	_lastMsgWasEven = !_lastMsgWasEven;
	newMsg.textContent = msg;
	_dom.log.appendChild(newMsg);

	// scroll down
	_dom.log.scrollTop = _dom.log.scrollHeight;
}

export default {
	init: init,
	log: log
};