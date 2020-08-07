import Engine from "../../../src/core/Engine.js";
import Manifest from "../../../src/assets/Manifest.js";
import RNG from "../../../src/utils/RNG.js";
import Helper from "../../../src/utils/Helper.js";
import Keyboard from "../../../src/input/Keyboard.js";
import Keys from "../../../src/input/Keys.js";
import Screen from "../../../src/game/Screen.js";
import Entity from "../../../src/game/Entity.js";
import BitmapText from "../../../src/game/BitmapText.js";

import PIXI from "../../../src/core/PIXIWrapper.js";

import Scope from "./Scope.js";

const screenWidth = Manifest.get("/w");
const screenHeight = Manifest.get("/h");

class Fruit extends Entity {
	constructor() {
		super();

		this.speed = 1;

		this.layer = 0;

		this.xDir = Helper.choose([-1, 1]);
		this.yDir = Helper.choose([-1, 1]);

		this.configSprite({
			sheet: "fruits",
			id: RNG.randomInteger(0, 6)
		});

		this.x = Math.max(0, Math.floor(Math.random() * screenWidth) - 8);
		this.y = Math.max(0, Math.floor(Math.random() * screenHeight) - 8);
	}

	update() {
		this.x += this.xDir * this.speed;
		this.y += this.yDir * this.speed;

		if (this.x < 0 || this.x + 8 > screenWidth) {
			this.xDir *= -1;
		}

		if (this.y < 0 || this.y + 8 > screenHeight) {
			this.yDir *= -1;
		}
	}
}

const _fruits = [];
const FruitPool = {
	getFruits: function(i) {
		if (i > _fruits.length) {
			let diff = i - _fruits.length;

			for (let i = 0; i < diff; i++) {
				_fruits.push(new Fruit());
			}
		}

		return _fruits.slice(0, i);
	}
}

class Fruitmark extends Screen {
	constructor() {
		super();

		// keep a reference so we can reuse it from the MenuScreen
		Scope.fruitmarkScreen = this;
	}

	init(entityCount) {
		let fruits = FruitPool.getFruits(entityCount);
		for (let f of fruits) {
			this.add(f);
		}

		//bg 1
		if (!this.bg1) {
			let bg1box = new PIXI.Graphics();
			bg1box.beginFill(0x4b5667);
			bg1box.drawRect(0, 0, screenWidth, 13);

			this.bg1 = new Entity();
			this.bg1.configSprite({
				replaceWith: bg1box
			});
		}

		this.add(this.bg1);

		// help text
		if (!this.helpText) {
			this.helpText = new BitmapText({
				x: 2,
				y: 2,
				font: "font1",
				text: "Press 'ESC' to go back",
				color: 0xFF0085
			});
			this.helpText.layer = 2;
		}

		this.add(this.helpText);

		//bg 2
		if (!this.bg2) {
			let bg2box = new PIXI.Graphics();
			bg2box.beginFill(0x4b5667);
			bg2box.drawRect(0, 0, screenWidth, 13);

			this.bg2 = new Entity();
			this.bg2.y = screenHeight - 12;
			this.bg2.configSprite({
				replaceWith: bg2box
			});
		}
		this.add(this.bg2);

		// info text
		if (!this.infoText) {
			this.infoText = new BitmapText({
				x: 2,
				y: screenHeight - 10,
				font: "font1",
				text: "",
				color: 0xFF0085
			});
			this.infoText.layer = 2;
		}
		this.infoText.setText(`Entities: ${entityCount}`);
		this.add(this.infoText);
	}

	update() {
		if (Keyboard.pressed(Keys.ESC)) {
			// Remove all entities... of course this get's slower the more entities you remove.
			// Yet it's ignorable for 10000 simultaneously removed entities.
			this.getEntities().forEach(this.remove.bind(this));
			Engine.screen = Scope.menuScreen;
		}
	}
}

export default Fruitmark;