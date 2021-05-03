// Engine imports
import PIXI from "../../../../src/core/PIXIWrapper.js";
import Screen from "../../../../src/game/Screen.js";
import BitmapText from "../../../../src/game/BitmapText.js";
import Keyboard from "../../../../src/input/Keyboard.js";
import Keys from "../../../../src/input/Keys.js";
import Helper from "../../../../src/utils/Helper.js";

// RL Stuff
import { xx, yy, char2id } from "../utils/RLHelper.js";
import Constants from "../Constants.js";
import Colors from "./tiling/Colors.js";
import RLMap from "../core/RLMap.js";
import RLActor from "../core/RLActor.js";
import Entity from "../../../../src/game/Entity.js";

class GameScreen extends Screen {
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
			tile.id = Helper.choose([char2id("."), char2id("."), char2id("."), char2id("."), char2id("."),char2id(","), char2id("."), char2id("."), char2id("."), char2id("♠")]);
			// tile.id = Helper.choose([36, 36, 36, 44, 44, 44, 44, 44, 33, 33, 33, 33, 96]);
			tile.color = Colors[11];
			tile.background = Colors[9];
		});
		this.add(firstMap);

		let player = new RLActor();
		player.id = 1; 128+33;
		player.color = Colors[0];
		player.moveTo(firstMap.get(10, 10));

		let enemy = new RLActor();
		enemy.id = char2id("@");
		enemy.color = Colors[5];
		enemy.moveTo(firstMap.get(5, 5));

		Keyboard.registerEndOfFrameHandler(function() {
			let c = player.getCell();
			let dx = 0;
			let dy = 0;
			if (Keyboard.wasPressedOrIsDown(Keys.LEFT)) {
				dx = -1;
			} else if (Keyboard.wasPressedOrIsDown(Keys.RIGHT)) {
				dx = +1;
			}
			if (Keyboard.wasPressedOrIsDown(Keys.UP)) {
				dy = -1;
			} else if (Keyboard.wasPressedOrIsDown(Keys.DOWN)) {
				dy = +1;
			}
			// firstMap.viewport.x += dx;
			// firstMap.viewport.y += dy;
			player.moveTo(firstMap.get(c.x + dx, c.y + dy));
		});

		window.player = player;
		window.fm = firstMap;

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
		pixiTextBG.drawRect(-5, -5, 215, 45);
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
`Damn. I broke by wrench.
Guess I'm just too strong.
Ah, what ya gonna do? ;)`,
			x: xx(23),
			y: yy(10),
			color: Colors[0]
		}));
	}
}

export default GameScreen;