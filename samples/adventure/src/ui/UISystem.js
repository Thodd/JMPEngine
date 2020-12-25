import HealthBar from "./HealthBar.js";

// container DOM elements
// DOM can be accessed, since the game is started only after the loaded event
const _dom = {
	stats:   document.getElementById("adv_stats"),
	hp:      document.getElementById("adv_stats_hp"),
	history: document.querySelector("#adv_history .wnd_content")
};


const playerHealthBar = new HealthBar();
_dom.hp.appendChild(playerHealthBar.getDom());


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
		_dom.history.removeChild(newMsg);
	} else {
		newMsg = document.createElement("p");
	}

	// add new msg and color row accordingly
	newMsg.className = _lastMsgWasEven ? "odd" : "even";
	_lastMsgWasEven = !_lastMsgWasEven;
	newMsg.innerHTML = msg;
	_dom.history.appendChild(newMsg);

	// scroll down
	_dom.history.scrollTop = _dom.history.scrollHeight;
}


/**
 * Called on stat change by the Player(State).
 * @param {Stats} stats the Stats instance of the player
 */
function updatePlayerStats(stats) {
	playerHealthBar.setMaxValue(stats.hp_max);
	playerHealthBar.setValue(stats.hp);
	//_dom.hp.textContent = `HP : ${stats.hp}/${stats.hp_max}`;
	// _dom.atk.textContent = `ATK: ${stats.atk}`;
	// _dom.def.textContent = `DEF: ${stats.def}`;
}


export default {
	log: log,
	updatePlayerStats: updatePlayerStats
};