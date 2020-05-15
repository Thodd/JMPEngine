import Manifest from "../../../src/Manifest.js";
import Screen from "../../../src/game/Screen.js";
import Entity from "../../../src/game/Entity.js";
import RNG from "../../../src/utils/RNG.js";
import Helper from "../../../src/utils/Helper.js";
import GFX from "../../../src/gfx/GFX.js";
import Keyboard from "../../../src/input/Keyboard.js";
import Keys from "../../../src/input/Keys.js";
import Engine from "../../../src/Engine.js";
import Text from "../../../src/gfx/Text.js";

import Scope from "./Scope.js";

const screenWidth = Manifest.get("/w");
const screenHeight = Manifest.get("/h");

class Fruit extends Entity {
	constructor() {
		super({});

		this.layer = 0;

		this.xDir = Helper.choose([-1, 1]);
		this.yDir = Helper.choose([-1, 1]);

		this.setSprite({
			sheet: "fruits",
			id: RNG.randomInteger(0, 6)
		});
	}

	added() {
		this.x = Math.max(0, Math.floor(Math.random() * screenWidth) - 8);
		this.y = Math.max(0, Math.floor(Math.random() * screenHeight) - 8);
	}

	update() {
		this.x += this.xDir * 1;
		this.y += this.yDir * 1;

		if (this.x < 0 || this.x + 8 > screenWidth) {
			this.xDir *= -1;
		}

		if (this.y < 0 || this.y + 8 > screenHeight) {
			this.yDir *= -1;
		}
	}
}

class Fruitmark extends Screen {
	constructor() {
		super();

		// keep a reference so we can reuse it from the MenuScreen
		Scope.fruitmarkScreen = this;
	}

	init(renderMode, entityCount) {
		this.renderMode = renderMode;

		for (let i = 0; i < entityCount; i++) {
			this.add(new Fruit({}));
		}

		let helpText = new Text({
			x: 2,
			y: 2,
			text: "Press 'ESC' to go back",
			color: "#FF0085",
			useKerning: true
		});
		helpText.layer = 2;
		this.add(helpText);
	}

	setup() {
		GFX.getBuffer(0).setRenderMode(this.renderMode);
	}

	update() {
		if (Keyboard.pressed(Keys.ESC)) {
			this.getEntities().forEach(this.remove.bind(this));
			Engine.screen = Scope.menuScreen;
		}
	}

	render() {
		GFX.get(1).rectf(0, 0, screenWidth, 12, "#332c50");
	}
}

export default Fruitmark;