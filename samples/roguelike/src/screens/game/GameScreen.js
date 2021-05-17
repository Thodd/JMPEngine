// Engine imports
import PIXI from "../../../../../src/core/PIXIWrapper.js";
import Spritesheets from "../../../../../src/assets/Spritesheets.js";
import Screen from "../../../../../src/game/Screen.js";
import BitmapText from "../../../../../src/game/BitmapText.js";
import Entity from "../../../../../src/game/Entity.js";
import Tilemap from "../../../../../src/game/Tilemap.js";

// RL Stuff
import { xx, yy, char2id } from "../../engine/utils/RLTools.js";
import Constants from "../../gamecontent/Constants.js";
import Colors from "../../gamecontent/Colors.js";

// map gen
import OverworldMap from "../../overworld/OverworldMap.js";

class GameScreen extends Screen {
	constructor() {
		super();

		// create world map and place it on the screen
		this._map = new OverworldMap();
		this._map.x = xx(1);
		this._map.y = yy(1);
		this.add(this._map);

		this._initUIElements();
	}

	/**
	 * Just some debugging information and UI Element design drafts
	 */
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
			text: "HP: █████░░░░░",
			x: xx(1),
			y: yy(43),
			color: Colors[7]
		}));
		this.add(new BitmapText({
			font: "rlfont",
			text: "SP: ███████░░░",
			x: xx(1),
			y: yy(44),
			color: Colors[3]
		}));
		this.add(new BitmapText({
			font: "rlfont",
			text: "* : 2/6 (23)",
			x: xx(1),
			y: yy(45),
			color: Colors[2]
		}));
		this.add(new BitmapText({
			font: "rlfont",
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
			color: Colors[0]
		}));

		this._minimapDebug();
	}

	_minimapDebug() {

		// debug minimap
		this._minimap = new Tilemap({
			sheet: "tileset",
			x: 0,
			y: 0,
			w: Constants.OVERWORLD_ROOM_COLUMNS,
			h: Constants.OVERWORLD_ROOM_ROWS
		});
		this._minimap.x = xx(1);
		this._minimap.y = yy(1);
		this._minimap.layer = Constants.Layers.UI;

		this._map.roomLayoutGenerator.each((r) => {
			let id = r.isFilled ? char2id("♠") : char2id("▲");
			let color = r.isFilled ? Colors[3] : Colors[8];
			let tile = this._minimap.get(r.x, r.y);
			tile.set(id);
			tile.setColor(color);
		});

		this._minimap.get(5,5).set(char2id("⌂"));
		this._minimap.get(5,5).setColor(Colors[5]);

		this._minimap.get(3,5).set(char2id("@"));
		this._minimap.get(3,5).setColor(Colors[0]);

		// minimap background
		let minimapBG = new Entity();
		minimapBG.layer = Constants.Layers.UI;
		minimapBG.x = xx(1);
		minimapBG.y = yy(1);
		let pixiMinimapBG = new PIXI.Graphics();
		pixiMinimapBG.beginFill(Colors[9]);
		pixiMinimapBG.drawRect(0, 0, Constants.OVERWORLD_ROOM_COLUMNS * Constants.TILE_WIDTH, Constants.OVERWORLD_ROOM_ROWS * Constants.TILE_HEIGHT);
		pixiMinimapBG.endFill();
		minimapBG.configSprite({replaceWith: pixiMinimapBG});
		this.add(minimapBG);

		this.add(this._minimap);
	}
}

export default GameScreen;