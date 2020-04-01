import { contains, remove } from "../utils/ArrayHelper.js";
import { log, warn } from "../utils/Log.js";

let aKeyDownList = [];
let aPressedList = [];
let iPressedCount = 0;
let aSymbolicNames = [];

let mEventHandlers = {
	"all": []
};

//Keeps track of downed keys
function fnKeyDownHandler(evt) {
	if (!aKeyDownList[evt.keyCode]) {
		aKeyDownList[evt.keyCode] = true;
		aPressedList[iPressedCount++] = evt.keyCode;
	}

	// registered handlers on specific keys
	if (mEventHandlers[evt.keyCode]) {
		mEventHandlers[evt.keyCode].forEach(function(fn) {
			fn();
		});
	}

	// handlers on "all" keys
	mEventHandlers["all"].forEach(function(fn) {
		fn();
	});
}

//keeps track of upped keys
function fnKeyUpHandler(evt) {
	if (aKeyDownList[evt.keyCode]) {
		aKeyDownList[evt.keyCode] = false;
	}
}

let initialized = false;

function init() {
	if (initialized) {
		warn("already initialized!", "GFX");
		return;
	}

	// adding the actual event listeners to the window object
	window.addEventListener("keydown", function (e) {
		fnKeyDownHandler(e);
	}, true);
	window.addEventListener("keyup", function (e) {
		//e.preventDefault();
		fnKeyUpHandler(e);
	}, true);

	log("module initialized.", "Keyboard");

	return _reset;
}

/**
 * Register to a browser keydown event.
 * The handlers are directly called once a browser event occurs.
 * However you can call the Keyboard polling functions to check the state of all pressed/down keys.
 *
 * @param {*} key
 * @param {*} handler
 */
function register(key, handler) {
	// no key given -> register to a general keydown event
	if (typeof key === "function" && !handler) {
		handler = key;
		key = "all";
	}

	mEventHandlers[key] = mEventHandlers[key] || [];
	if (!contains(handler, mEventHandlers[key])) {
		mEventHandlers[key].push(handler);
	}
}

/**
 * Deregisters a previously registered Keyboard event handler.
 *
 * @param {*} key
 * @param {*} handler
 */
function deregister(key, handler) {
	// no key given -> deregister to a general keydown event
	if (typeof key === "function") {
		handler = key;
		key = "all";
	}

	let list = mEventHandlers[key];
	if (list) {
		remove(handler, mEventHandlers[key]);
	}
}

//Define symbolic names (strings) as placeholders for Key-Values
function define(symbols) {
	//symbols looks like this:
	/*
	 * { "nameForKey": Keys.SPACE, ... }
	 */
	var strName;
	//iterate all given symbolic names
	for (strName in symbols) {
		aSymbolicNames[strName] = symbols[strName];
	}
}

function resolveKey(key) {
	var t = typeof (key);
	if (t === "string") {
		return aSymbolicNames[key];
	} else if (t === "number") {
		return key;
	}
}

//Check if a given Key (symbolic string or number) is down
function down(key) {
	return aKeyDownList[resolveKey(key)];
}

//check if the given key was pressed in the last frame
function pressed(key) {
	return (aPressedList.indexOf(resolveKey(key)) >= 0);
}

// checks if the key was either pressed or is down
function wasPressedOrIsDown(key) {
	return this.pressed(key) || this.down(key);
}

//reseting the "was pressed" list each frame
//called by the game loop
function _reset() {
	while (iPressedCount--) {
		aPressedList[iPressedCount] = 0;
	}
	iPressedCount = 0;
}

/*
// get the gamepad button/axes states
function _pollgamepads() {
	var agamepads = navigator && navigator.getgamepads && navigator.getgamepads();
	if (agamepads && agamepads[0]) {
		var oPad = agamepads[0];

		//buttons
		for (var i = 0; i < oPad.buttons.length; i++) {
			var oButton = oPad.buttons[i];
			var iBtnCode = Gamepad["BUTTON_"+i];

			if (oButton.pressed) {
				if (!aKeyDownList[iBtnCode]) {
					aKeyDownList[iBtnCode] = true;
					aPressedList[iPressedCount++] = iBtnCode;
				}
			} else {
				if (aKeyDownList[iBtnCode]) {
					aKeyDownList[iBtnCode] = false;
				}
			}
		}

		// axes
		// horizontal
		var iHorizontal = oPad.axes[0];
		if (iHorizontal <= -1) {
			if (!aKeyDownList[Gamepad.LEFT]) {
				aKeyDownList[Gamepad.LEFT] = true;
				aPressedList[iPressedCount++] = Gamepad.LEFT;
			}
		} else if (iHorizontal >= 1) {
			if (!aKeyDownList[Gamepad.RIGHT]) {
				aKeyDownList[Gamepad.RIGHT] = true;
				aPressedList[iPressedCount++] = Gamepad.RIGHT;
			}
		} else {
			if (aKeyDownList[Gamepad.LEFT]) {
				aKeyDownList[Gamepad.LEFT] = false;
			}
			if (aKeyDownList[Gamepad.RIGHT]) {
				aKeyDownList[Gamepad.RIGHT] = false;
			}
		}

		// vertical
		var iVertical = oPad.axes[1];
		if (iVertical <= -1) {
			if (!aKeyDownList[Gamepad.UP]) {
				aKeyDownList[Gamepad.UP] = true;
				aPressedList[iPressedCount++] = Gamepad.UP;
			}
		} else if (iVertical >= 1) {
			if (!aKeyDownList[Gamepad.DOWN]) {
				aKeyDownList[Gamepad.DOWN] = true;
				aPressedList[iPressedCount++] = Gamepad.DOWN;
			}
		} else {
			if (aKeyDownList[Gamepad.UP]) {
				aKeyDownList[Gamepad.UP] = false;
			}
			if (aKeyDownList[Gamepad.DOWN]) {
				aKeyDownList[Gamepad.DOWN] = false;
			}
		}
	}
}
*/
export default {
	init,
	define,
	down,
	pressed,
	wasPressedOrIsDown,
	register,
	deregister
};