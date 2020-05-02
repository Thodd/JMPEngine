import { contains, remove } from "../utils/Helper.js";
import { log, warn } from "../utils/Log.js";

let keyDownList = [];
let pressedList = [];
let pressedCount = 0;
let symbolicNames = [];

let eventHandlers = {
	"all": []
};

//Keeps track of downed keys
function keyDownHandlerImpl(evt) {
	if (!keyDownList[evt.keyCode]) {
		keyDownList[evt.keyCode] = true;
		pressedList[pressedCount++] = evt.keyCode;
	}

	// registered handlers on specific keys
	if (eventHandlers[evt.keyCode]) {
		eventHandlers[evt.keyCode].forEach(function(fn) {
			fn();
		});
	}

	// handlers on "all" keys
	eventHandlers["all"].forEach(function(fn) {
		fn();
	});
}

//keeps track of upped keys
function keyUpHandlerImpl(evt) {
	if (keyDownList[evt.keyCode]) {
		keyDownList[evt.keyCode] = false;
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
		keyDownHandlerImpl(e);
	}, true);
	window.addEventListener("keyup", function (e) {
		//e.preventDefault();
		keyUpHandlerImpl(e);
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

	eventHandlers[key] = eventHandlers[key] || [];
	if (!contains(handler, eventHandlers[key])) {
		eventHandlers[key].push(handler);
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

	let list = eventHandlers[key];
	if (list) {
		remove(handler, eventHandlers[key]);
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
		symbolicNames[strName] = symbols[strName];
	}
}

function resolveKey(key) {
	var t = typeof (key);
	if (t === "string") {
		return symbolicNames[key];
	} else if (t === "number") {
		return key;
	}
}

//Check if a given Key (symbolic string or number) is down
function down(key) {
	return keyDownList[resolveKey(key)];
}

//check if the given key was pressed in the last frame
function pressed(key) {
	return (pressedList.indexOf(resolveKey(key)) >= 0);
}

// checks if the key was either pressed or is down
function wasPressedOrIsDown(key) {
	return this.pressed(key) || this.down(key);
}

//reseting the "was pressed" list each frame
//called by the game loop
function _reset() {
	while (pressedCount--) {
		pressedList[pressedCount] = 0;
	}
	pressedCount = 0;
}

/*
// get the gamepad button/axes states
function _pollgamepads() {
	var gamepads = navigator && navigator.getgamepads && navigator.getgamepads();
	if (gamepads && gamepads[0]) {
		var pad = gamepads[0];

		//buttons
		for (var i = 0; i < pad.buttons.length; i++) {
			var button = pad.buttons[i];
			var btnCode = Gamepad["BUTTON_"+i];

			if (button.pressed) {
				if (!keyDownList[btnCode]) {
					keyDownList[btnCode] = true;
					pressedList[pressedCount++] = btnCode;
				}
			} else {
				if (keyDownList[btnCode]) {
					keyDownList[btnCode] = false;
				}
			}
		}

		// axes
		// horizontal
		var horizontal = pad.axes[0];
		if (horizontal <= -1) {
			if (!keyDownList[Gamepad.LEFT]) {
				keyDownList[Gamepad.LEFT] = true;
				pressedList[pressedCount++] = Gamepad.LEFT;
			}
		} else if (horizontal >= 1) {
			if (!keyDownList[Gamepad.RIGHT]) {
				keyDownList[Gamepad.RIGHT] = true;
				pressedList[pressedCount++] = Gamepad.RIGHT;
			}
		} else {
			if (keyDownList[Gamepad.LEFT]) {
				keyDownList[Gamepad.LEFT] = false;
			}
			if (keyDownList[Gamepad.RIGHT]) {
				keyDownList[Gamepad.RIGHT] = false;
			}
		}

		// vertical
		var vertical = pad.axes[1];
		if (vertical <= -1) {
			if (!keyDownList[Gamepad.UP]) {
				keyDownList[Gamepad.UP] = true;
				pressedList[pressedCount++] = Gamepad.UP;
			}
		} else if (vertical >= 1) {
			if (!keyDownList[Gamepad.DOWN]) {
				keyDownList[Gamepad.DOWN] = true;
				pressedList[pressedCount++] = Gamepad.DOWN;
			}
		} else {
			if (keyDownList[Gamepad.UP]) {
				keyDownList[Gamepad.UP] = false;
			}
			if (keyDownList[Gamepad.DOWN]) {
				keyDownList[Gamepad.DOWN] = false;
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