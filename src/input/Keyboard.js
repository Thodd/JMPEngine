import { contains, remove } from "../utils/Helper.js";
import { log } from "../utils/Log.js";

const keyDownList = [];
const pressedList = [];
let pressedCount = 0;
const symbolicNames = [];

const endOfFrameHandlers = [];
let scheduledEndOfFrameHandlers = false;

const eventHandlers = {
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
			fn(evt.keyCode);
		});
	}

	// handlers on "all" keys
	eventHandlers["all"].forEach(function(fn) {
		fn(evt.keyCode);
	});

	scheduledEndOfFrameHandlers=true;
}

//keeps track of upped keys
function keyUpHandlerImpl(evt) {
	if (keyDownList[evt.keyCode]) {
		keyDownList[evt.keyCode] = false;
	}
}

function init() {
	// adding the actual event listeners to the window object
	window.addEventListener("keydown", function (e) {
		keyDownHandlerImpl(e);
	}, true);
	window.addEventListener("keyup", function (e) {
		keyUpHandlerImpl(e);
	}, true);

	log("module initialized.", "Keyboard");
	return _reset;
}

/**
 * Register to a browser keydown event.
 * The handlers are directly called once a browser event occurs.
 * However you can call the Keyboard polling functions to check the state of all pressed/down keys.
 * If the parameter 'key' is set to 'all' or undefined, each keyboard event is propagated.
 *
 * @param {string} key
 * @param {function} handler
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
 * @param {string} key
 * @param {function} handler
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

/**
 * Registers a keyboard event handler to be called at the end of the current frame.
 * The currently pressed keys can be polled with Keyboard.isDown(...) etc.
 * @param {function} handler the function to be called at the end of a frame after a native keypress event
 */
 function registerEndOfFrameHandler(handler) {
	if (!contains(handler, endOfFrameHandlers)) {
		endOfFrameHandlers.push(handler);
	}
}

/**
 * Deregisters a previously registered end-of-frame handler.
 * @param {function} handler the end-of-frame handler which will be deregistered
 */
function deregisterEndOfFrameHandler(handler) {
	remove(handler, endOfFrameHandlers);
}

//Define symbolic names (strings) as placeholders for Key-Values
function define(symbols) {
	//symbols looks like this:
	/*
	 * { "nameForKey": Keys.SPACE, ... }
	 */
	let strName;
	//iterate all given symbolic names
	for (strName in symbols) {
		symbolicNames[strName] = symbols[strName];
	}
}

function resolveKey(key) {
	let t = typeof (key);
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

	if (scheduledEndOfFrameHandlers) {
		endOfFrameHandlers.forEach(function(fn) {
			fn();
		});
		scheduledEndOfFrameHandlers = false;
	}
}

/*
// get the gamepad button/axes states
function _pollgamepads() {
	let gamepads = navigator && navigator.getgamepads && navigator.getgamepads();
	if (gamepads && gamepads[0]) {
		let pad = gamepads[0];

		//buttons
		for (let i = 0; i < pad.buttons.length; i++) {
			let button = pad.buttons[i];
			let btnCode = Gamepad["BUTTON_"+i];

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
		let horizontal = pad.axes[0];
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
		let vertical = pad.axes[1];
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
	deregister,
	registerEndOfFrameHandler,
	deregisterEndOfFrameHandler
};