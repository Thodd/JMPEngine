import Engine from "../../../src/core/Engine.js";
import Screen from "../../../src/game/Screen.js";
import Keyboard from "../../../src/input/Keyboard.js";
import Keys from "../../../src/input/Keys.js";
import BitmapText from "../../../src/game/BitmapText.js";

import ColorPalette from "./ColorPalette.js";

// list of all demo screens
import Static from "./static/Static.js";
import Plasma from "./plasma/Plasma.js";

const demoList = [
	{
		name: "Static",
		screenClass: Static
	},
	{
		name: "Plasma",
		screenClass: Plasma
	},
	{
		name: "Moire",
		screenClass: "Moiré"
	}
]

// render values
const COLOR_TEXT = ColorPalette.asInt[7];
const COLOR_SELECTED = ColorPalette.asInt[9];

// cursor handling
let currentDemoSelected;

class SelectScreen extends Screen {
	constructor() {
		super();

		this.setupTitle();

		this.createDemolist();

		this.selectDemo(0);
	}

	begin() {
		// select demo from menu
		this._menuKeyHandler = Keyboard.registerEndOfFrameHandler(() => {
			if (Keyboard.wasPressedOrIsDown(Keys.DOWN)) {
				let i = demoList.indexOf(currentDemoSelected);
				i = (i+1) % demoList.length;
				this.selectDemo(i);
			} else if (Keyboard.wasPressedOrIsDown(Keys.UP)) {
				let i = demoList.indexOf(currentDemoSelected);
				i = (i - 1) < 0 ? i = demoList.length - 1 : i - 1;
				this.selectDemo(i);
			} else if (Keyboard.wasPressedOrIsDown(Keys.ENTER)) {
				this.activateDemo();
				Keyboard.deregisterEndOfFrameHandler(this._menuKeyHandler);
			}
		});
	}

	setupTitle() {
		this.title = new BitmapText({
			font: "font1",
			color: COLOR_TEXT,
			text: `Choose Demo: [<c=${ColorPalette.asString[8]}>ENTER</c>]`
		});
		this.title.x = (240 - this.title.getLocalBounds().width) / 2;
		this.title.y = 8;

		const w = this.title.getLocalBounds().width;
		this.title.pivotPoint = { x: w / 2 };

		this.title.x += w / 2;

		this.title.wobbleCount = 0;
		this.title.update = function() {
			this.wobbleCount += 0.05;
			let wobble = Math.sin(this.wobbleCount);
			this.rotationDeg = 2 * wobble;
			const scale = 1 + Math.abs(0.25 * wobble);
			this.scale = {x: scale, y: scale};
		}
		this.add(this.title);
	}

	createDemolist() {
		for (let i = 0; i < demoList.length; i++) {
			let demoDef = demoList[i];
			demoList[i].menuEntry = new BitmapText({
				font: "font1",
				color: COLOR_TEXT,
				x: 16,
				y: 24 + i * 12,
				text: demoDef.name
			});
			this.add(demoList[i].menuEntry);
		}
	}

	selectDemo(i) {
		if (currentDemoSelected) {
			currentDemoSelected.menuEntry.setColor(COLOR_TEXT);
		}
		currentDemoSelected = demoList[i];
		currentDemoSelected.menuEntry.setColor(COLOR_SELECTED);
	}

	activateDemo() {
		if (!currentDemoSelected.screenInstance) {
			currentDemoSelected.screenInstance = new currentDemoSelected.screenClass();
			currentDemoSelected.screenInstance.setMenuScreen(this);
		}
		Engine.screen = currentDemoSelected.screenInstance;
	}
}

export default SelectScreen;