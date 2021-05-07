// Engine imports
import PIXI from "../../../../../src/core/PIXIWrapper.js";
import Spritesheets from "../../../../../src/assets/Spritesheets.js";
import Screen from "../../../../../src/game/Screen.js";
import BitmapText from "../../../../../src/game/BitmapText.js";
import Entity from "../../../../../src/game/Entity.js";

// RL Stuff
import { xx, yy } from "../../utils/RLHelper.js";
import Constants from "../../Constants.js";
import Colors from "../../Colors.js";

// map gen
import Overworld from "../levelgen/Overworld.js";

// controllers
import GameController from "../controller/GameController.js";
class GameScreen extends Screen {
	constructor() {
		super();

		// create world map and place it on the screen
		this._map = new Overworld();
		this._map.x = xx(1);
		this._map.y = yy(1);
		this.add(this._map);

		this._initUIElements();

		this._initControllers();
	}

	getMap() {
		return this._map;
	}

	_initControllers() {
		this._gameController = new GameController(this);
	}

	update() {
		this._gameController.update();
	}

	_initUIElements() {
		// sizes
		let sheet = Spritesheets.getSheet("tileset");
		let tw = sheet.w;
		let th = sheet.h;

		// Background for UI Elements at the bottom
		let bottomUIBG = new Entity();
		let pixiBottomUIBG = new PIXI.Graphics();
		pixiBottomUIBG.beginFill(Colors[9]);
		// --- stats
		pixiBottomUIBG.drawRect(0, 0, 17 * tw, 6 * th);
		// --- log
		pixiBottomUIBG.drawRect(18 * tw, 0, 42 * tw, 6 * th);
		pixiBottomUIBG.endFill();
		bottomUIBG.configSprite({
			replaceWith: pixiBottomUIBG
		});
		bottomUIBG.x = xx(1);
		bottomUIBG.y = yy(42);
		this.add(bottomUIBG);

		// Stats texts
		this.add(new BitmapText({
			font: "rlfont",
			leading: 2,
			text: "Thor Heyerdahl",
			x: xx(1),
			y: yy(42),
			color: Colors[0]
		}));
		this.add(new BitmapText({
			font: "rlfont",
			leading: 2,
			text: "HP: ▓▓▓▓▓░░░░░",
			x: xx(1),
			y: yy(44),
			color: Colors[7]
		}));
		this.add(new BitmapText({
			font: "rlfont",
			leading: 2,
			text: "* : 2/6 (23)",
			x: xx(1),
			y: yy(45),
			color: Colors[2]
		}));
		this.add(new BitmapText({
			font: "rlfont",
			leading: 2,
			text: "$ : 203",
			x: xx(1),
			y: yy(46),
			color: Colors[5]
		}));

		// Log
		this.add(new BitmapText({
			font: "rlfont",
			text:
`Dr Strand:
Damn. I broke my wrench.
Guess I'm just too strong.
Ah, what ya gonna do, eh?
Would you mind helping me find a new one?`,
			x: xx(19),
			y: yy(42),
			color: Colors[8]
		}));

		// add minimap for debugging
		let minimapBG = new Entity();
		minimapBG.x = xx(1);
		minimapBG.y = yy(1);
		let pixiMinimapBG = new PIXI.Graphics();
		pixiMinimapBG.beginFill(Colors[9]);
		pixiMinimapBG.drawRect(0, 0, Constants.OVERWORLD_ROOM_COLUMNS * 8, Constants.OVERWORLD_ROOM_ROWS * 8);
		pixiMinimapBG.endFill();
		minimapBG.configSprite({replaceWith: pixiMinimapBG});
		this.add(minimapBG);

		this._map.roomLayoutGenerator.minimap.x = xx(1);
		this._map.roomLayoutGenerator.minimap.y = yy(1);
		this.add(this._map.roomLayoutGenerator.minimap);
	}
}

export default GameScreen;