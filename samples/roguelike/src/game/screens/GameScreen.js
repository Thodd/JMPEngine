// Engine imports
import PIXI from "../../../../../src/core/PIXIWrapper.js";
import Manifest from "../../../../../src/assets/Manifest.js";
import Spritesheets from "../../../../../src/assets/Spritesheets.js";
import Screen from "../../../../../src/game/Screen.js";
import BitmapText from "../../../../../src/game/BitmapText.js";

// RL Stuff
import { xx, yy } from "../../utils/RLHelper.js";

import Colors from "../../Colors.js";
import Entity from "../../../../../src/game/Entity.js";
import GameController from "../controller/GameController.js";
import Overworld from "../levelgen/Overworld.js";

class GameScreen extends Screen {
	constructor() {
		super();

		// create world map and place it on the screen
		this._map = new Overworld();
		this._map.x = xx(1);
		this._map.y = yy(1);
		this.add(this._map);

		this._initControllers();

		this._debugStuff();
	}

	getMap() {
		return this._map;
	}

	_initControllers() {
		this._gameController = new GameController(this);
	}

	_debugStuff() {
		this.add(new BitmapText({
			font: "rlfont",
			leading: 2,
			text: "HP: 30/44",
			x: xx(1),
			y: yy(0),
			color: Colors[7]
		}));

		// sizes
		let w = Manifest.get("/w");
		let h = Manifest.get("/h");
		let sheet = Spritesheets.getSheet("tileset");
		let tw = sheet.w;
		let th = sheet.h;

		let textBG = new Entity();
		let pixiTextBG = new PIXI.Graphics();
		pixiTextBG.beginFill(Colors[9]);
		pixiTextBG.drawRect(0, 0, w - 2 * tw, 6 * th);
		pixiTextBG.endFill();
		textBG.configSprite({
			replaceWith: pixiTextBG
		});
		textBG.x = xx(1);
		textBG.y = yy(33);
		this.add(textBG);

		this.add(new BitmapText({
			font: "rlfont",
			leading: 3,
			text:
`Dr Strand:
Damn. I broke my wrench.
Guess I'm just too strong.
Ah, what ya gonna do, eh?
Would you mind helping me find a new one?`,
			x: xx(1),
			y: yy(33),
			color: Colors[0]
		}));
	}
}

export default GameScreen;