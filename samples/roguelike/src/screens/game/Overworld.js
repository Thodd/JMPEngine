import Screen from "../../../../../src/game/Screen.js";
import BitmapText from "../../../../../src/game/BitmapText.js";

import Constants from "../../Constants.js";
import { xx, yy, char2id } from "../../utils/RLHelper.js";
import RLMap from "../../core/RLMap.js";
import RLActor from "../../core/RLActor.js";

class Overworld extends Screen {
	constructor() {
		super();

		let firstMap = new RLMap({
			sheet: "tileset",
			x: xx(1),
			y: yy(1),
			w: Constants.MAP_WIDTH,
			h: Constants.MAP_HEIGHT,
			viewport: {
				x: 0,
				y: 0,
				w: Constants.MAP_VIEWPORT_WIDTH,
				h: Constants.MAP_VIEWPORT_HEIGHT
			}
		});
		firstMap.each((tile) => {
			tile.id = char2id(".");
			tile.color = 0x111111;
			tile.background = 0x000001;
		});
		this.add(firstMap);

		let player = new RLActor();
		player.id = char2id("@");
		player.color = 0x0085FF;
		player.moveTo(firstMap.get(2, 3));

		window.player = player;
		window.fm = firstMap;

		this.add(new BitmapText({
			font: Constants.FONT_NAME,
			text: "Inventory\n> Pistol (3/6)\nMedkit (+)",
			x: xx(30),
			y: yy(1),
			color: 0x0085FF
		}));
	}
}

export default Overworld;