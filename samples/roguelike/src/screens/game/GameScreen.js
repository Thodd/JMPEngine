// JMP imports
import PIXI from "../../../../../src/core/PIXIWrapper.js";
import Screen from "../../../../../src/game/Screen.js";
import Entity from "../../../../../src/game/Entity.js";
import Tilemap from "../../../../../src/game/Tilemap.js";

// engine imports
import { xx, yy, char2id } from "../../engine/utils/RLTools.js";

// gamecontent imports
import Constants from "../../gamecontent/Constants.js";
import Colors from "../../gamecontent/Colors.js";

// ui imports
import History from "../../ui/History.js";
import PlayerHealth from "../../ui/PlayerHealth.js";

// map gen
import OverworldMap from "../../overworld/OverworldMap.js";

class GameScreen extends Screen {
	constructor() {
		super();

		// create world map and place it on the screen
		this._map = new OverworldMap();
		this.add(this._map);

		this._initUIElements();
	}

	begin() {
		this._history.sub();
		this._playerHealth.sub();
	}

	end() {
		this._history.unsub();
		this._playerHealth.unsub();
	}

	/**
	 * Just some debugging information and UI Element design drafts
	 */
	_initUIElements() {
		// player health
		this._playerHealth = new PlayerHealth({
			screen: this,
			x: xx(1),
			y: yy(42)
		});

		// history
		this._history = new History({
			screen: this,
			x: xx(19),
			y: yy(42)
		});

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