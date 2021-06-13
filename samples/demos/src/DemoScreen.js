import Engine from "../../../src/core/Engine.js";
import BitmapText from "../../../src/game/BitmapText.js";
import Screen from "../../../src/game/Screen.js";
import Keyboard from "../../../src/input/Keyboard.js";
import Keys from "../../../src/input/Keys.js";
import ColorPalette from "./ColorPalette.js";

class DemoScreen extends Screen {
	constructor() {
		super();
		this._pressEscapeText = new BitmapText({
			font: "font1",
			x: 2,
			y: 144 - 10,
			text: `Press <c=${ColorPalette.asString[8]}>ESC</c> to go back.`
		});
		this.add(this._pressEscapeText);
	}

	setMenuScreen(menuScreen) {
		this._menuScreen = menuScreen;
	}

	begin() {
		// go back to main menu
		this._escHandler = Keyboard.registerEndOfFrameHandler(() => {
			if (Keyboard.wasPressedOrIsDown(Keys.ESC)) {
				// important: deregister keyboard handler, so we ignore keypressed while the screen is inactive
				Keyboard.deregisterEndOfFrameHandler(this._escHandler);
				// reset all timers and intervals (for fading help text)
				this.cancelFrameEvent(this._escFadeTimer);
				this.cancelFrameEvent(this._escInterval);
				// switch to the select menu again
				Engine.screen = this._menuScreen;
			}
		});

		// show "press ESC" text ...
		this._pressEscapeText.alpha = 1;

		// ... and fade it out after a second
		this._escFadeTimer = this.registerFrameEvent(() => {
			this._escInterval = this.registerFrameEventInterval(() => {
				this._pressEscapeText.alpha -= 0.1;
				if (this._pressEscapeText.alpha < 0) {
					this.cancelFrameEvent(this._escInterval);
				}
			}, 5);
		}, 60);
	}
}

export default DemoScreen;