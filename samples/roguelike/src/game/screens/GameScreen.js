// Engine imports
import PIXI from "../../../../../src/core/PIXIWrapper.js";
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

		let textBG = new Entity();
		let pixiTextBG = new PIXI.Graphics();
		pixiTextBG.beginFill(Colors[10]);
		pixiTextBG.drawRect(-5, -5, 215, 40);
		pixiTextBG.endFill();
		textBG.configSprite({
			replaceWith: pixiTextBG
		});
		textBG.x = xx(23);
		textBG.y = yy(10);
		this.add(textBG);

		this.add(new BitmapText({
			font: "font1",
			leading: 3,
			text:
`Damn. I broke my wrench.
Guess I'm just too strong.
Ah, what ya gonna do? ;)`,
			x: xx(23),
			y: yy(10),
			color: Colors[0]
		}));
	}
}

export default GameScreen;