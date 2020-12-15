const _dom = {};


// DOM can be accessed, since the game is started only after the loaded event
_dom.stats = document.getElementById("adv_stats");
_dom.hp = document.getElementById("adv_stats_hp");
_dom.atk = document.getElementById("adv_stats_atk");
_dom.def = document.getElementById("adv_stats_def");

_dom.history = document.querySelector("#adv_history .wnd_content");


// number of max messages (keep the dom small)
let maxMsgs = 100;

// track the last message type
let _lastMsgWasEven = true;

function log(msg) {
	// reuse existing DOM elements
	maxMsgs--;
	let newMsg;
	if (maxMsgs < 0) {
		newMsg = _dom.history.firstElementChild;
	} else {
		newMsg = document.createElement("p");
	}

	// add new msg and color row accordingly
	newMsg.className = _lastMsgWasEven ? "odd" : "even";
	_lastMsgWasEven = !_lastMsgWasEven;
	newMsg.textContent = msg;
	_dom.history.appendChild(newMsg);

	// scroll down
	_dom.history.scrollTop = _dom.history.scrollHeight;
}


/**
 * Called on stat change by the Player(State).
 * @param {Stats} stats the Stats instance of the player
 */
function updatePlayerStats(stats) {
	_dom.hp.textContent = `HP : ${stats.hp}/${stats.hp_max}`;
	_dom.atk.textContent = `ATK: ${stats.atk}`;
	_dom.def.textContent = `DEF: ${stats.def}`;
}

export default {
	log: log,
	updatePlayerStats: updatePlayerStats
};