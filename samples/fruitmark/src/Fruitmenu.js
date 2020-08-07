import Screen from "../../../src/game/Screen.js";
import BitmapText from "../../../src/game/BitmapText.js";
import Manifest from "../../../src/assets/Manifest.js";
import Engine from "../../../src/core/Engine.js";
import Fruitmark from "./Fruitmark.js";

import Keyboard from "../../../src/input/Keyboard.js";
import Keys from "../../../src/input/Keys.js";

import Scope from "./Scope.js";
import Entity from "../../../src/game/Entity.js";
import PIXI from "../../../src/core/PIXIWrapper.js";
class Fruitmenu extends Screen {
	constructor() {
		super();

		// keep a reference in the Scope, so we can reuse it from the Fruitmark screen
		Scope.menuScreen = this;

		this.currentOption = 0;

		this.options = [
			{
				title: "Entities:  1000",
				entityCount: 1000,
			},
			{
				title: "Entities:  2000",
				entityCount: 2000,
			},
			{
				title: "Entities:  5000",
				entityCount: 5000,
			},
			{
				title: "Entities: 10000",
				entityCount: 10000,
			},
			{
				title: "Entities: 15000",
				entityCount: 15000,
			},
			{
				title: "Entities: 20000",
				entityCount: 20000,
			}
		];

		// offset for positioning in the middle of the screen
		this.yOffset = Math.round((Manifest.get("/h") - this.options.length * 15) / 2);

		// menu marker
		let markerBox = new PIXI.Graphics();
		markerBox.beginFill(0x4b5667);
		markerBox.drawRect(0, 0, 130, 14);

		this.menuMarker = new Entity();
		this.menuMarker.configSprite({
			replaceWith: markerBox
		});

		this.add(this.menuMarker);

		this.createTexts();
	}

	createTexts() {
		this.options.forEach((o, i) => {
			let t = new BitmapText({
				x: 70,
				y: this.yOffset + i * 15,
				text: o.title,
				font: "font1",
				color: 0xFF0085
			});
			t.layer = 1;
			this.add(t);
		});
	}

	update() {
		if (Keyboard.pressed(Keys.DOWN)) {
			this.currentOption += 1;
		} else if (Keyboard.pressed(Keys.UP)) {
			this.currentOption -= 1;
		}

		if (Keyboard.pressed(Keys.ENTER)) {
			let opt = this.options[this.currentOption];

			if (!Scope.fruitmarkScreen) {
				Scope.fruitmarkScreen = new Fruitmark();
			}
			Scope.fruitmarkScreen.init(opt.entityCount);

			Engine.screen = Scope.fruitmarkScreen;
			return;
		}

		if (this.currentOption < 0) {
			this.currentOption = this.options.length-1;
		} else if (this.currentOption >= this.options.length) {
			this.currentOption = 0;
		}

		this.menuMarker.x = 64;
		this.menuMarker.y = this.yOffset + this.currentOption * 15 - 3;
	}

}

export default Fruitmenu;