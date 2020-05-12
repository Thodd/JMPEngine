import Screen from "../../../src/game/Screen.js"
import BGRenderer from "./BGRenderer.js";
import Entity from "../../../src/game/Entity.js";
import Keyboard from "../../../src/input/Keyboard.js";
import Keys from "../../../src/input/Keys.js";
import { clamp } from "../../../src/utils/Helper.js";
import Score from "./Score.js";
import Engine from "../../../src/Engine.js";
import GameScreen from "./GameScreen.js";
import GFX from "../../../src/gfx/GFX.js";

class LevelSelectScreen extends Screen {
	constructor() {
		super();

		this.add(new BGRenderer());

		this.ui = new Entity({x: 83, y: 50});
		this.ui.setSprite({
			sheet: "LevelSelect"
		});
		this.add(this.ui);

		this.cursor = new Entity({x: 92, y: 90});
		this.cursor.setSprite({
			sheet: "bricks",
			id: 43
		});
		this.add(this.cursor);

		this.cursorPos = {
			col: 0,
			row: 0
		};
	}

	setup() {
		GFX.getBuffer(0).setClearColor("#38a8f2");
	}

	update() {
		super.update();

		if (Keyboard.pressed(Keys.RIGHT)) {
			this.cursorPos.col++;
		} else if (Keyboard.pressed(Keys.LEFT)) {
			this.cursorPos.col--;
		}

		if (Keyboard.pressed(Keys.DOWN)) {
			this.cursorPos.row++;
		} else if (Keyboard.pressed(Keys.UP)) {
			this.cursorPos.row--;
		}

		this.cursorPos.col = clamp(this.cursorPos.col, 0, 4);
		this.cursorPos.row = clamp(this.cursorPos.row, 0, 1);

		this.cursor.x = 92 + this.cursorPos.col * 16;
		this.cursor.y = 90 + this.cursorPos.row * 10;

		if (Keyboard.pressed(Keys.ENTER)) {
			Score.setLevel(5 * this.cursorPos.row + this.cursorPos.col);
			Engine.screen = new GameScreen();
		}
	}
}
export default LevelSelectScreen;