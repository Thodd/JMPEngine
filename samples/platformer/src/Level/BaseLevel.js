import Screen from "../../../../src/game/Screen.js";
import Entity from "../../../../src/game/Entity.js";
import Tilemap from "../../../../src/game/Tilemap.js";
import BitmapText from "../../../../src/gfx/BitmapText.js";
import RNG from "../../../../src/utils/RNG.js";
import Helper from "../../../../src/utils/Helper.js";
import Player from "../Actors/Player.js";
import GFX from "../../../../src/gfx/GFX.js";
import Manifest from "../../../../src/Manifest.js";
import Buffer from "../../../../src/gfx/Buffer.js";

class BaseLevel extends Screen {
	constructor() {
		super();

		const width = Manifest.get("/w");
		const height = Manifest.get("/h");

		//Entity.RENDER_HITBOXES = "#FF0085";

		// background
		let bg = new Entity();
		bg.layer = 0;
		bg.setSprite({
			sheet: "background"
		});
		this.add(bg);

		// basic tilemap
		let t = new Tilemap({sheet: "tileset", x: 50, y: 50});
		t.setTypes(["tiles"]);
		t.x = 0;
		t.y = 0;
		t.layer = 1;

		for (let x = 0; x < 16; x++) {
			let tile = t.get(x, 11);
			tile.isBlocking = true;
			tile.set(Helper.choose([11, 12, 13, 14, 15]));
		}
		this.add(t);

		// block tower
		let tile = t.get(10, 10);
		tile.set(11);
		tile.isBlocking = true;

		tile = t.get(10, 9);
		tile.set(Helper.choose([11, 12, 13, 14, 15]));
		tile.isBlocking = true;

		tile = t.get(10, 8);
		tile.set(11);
		tile.isBlocking = true;

		// demo entities
		for (let i = 0; i < 1 ; i++) {
			let e = new Entity({
				x: RNG.randomInteger(0, 120),
				y: RNG.randomInteger(0, 88)
			});
			e.hitbox.w = 8;
			e.hitbox.h = 8;
			e.setTypes(["box"]);
			e.layer = 2;
			e.setSprite({
				sheet:"tileset",
				id: 9
			});
			e.xDif = Helper.choose([-1, 1]);
			e.yDif = Helper.choose([-1, 1]);
			e.update = function() {
				this.x += this.xDif;
				this.y += this.yDif;

				if (this.x < 0 || this.x > width) {
					this.xDif *= -1;
				}

				if (this.y < 0 || this.y > height) {
					this.yDif *= -1;
				}
			};
			this.add(e);
		}

		// create player
		let player = new Player({x: 80, y: 40});
		player.layer = 2;
		this.add(player);
		window.player = player; // only used for debugging (do NOT do this in a real game ;))

		// initial Camera offset
		this.cam.x = player.x - 70;

		// text demo
		let textBG = new BitmapText({text: "Platformer Demo", x: 2, y: 2, color: "#000000", useKerning: true});
		textBG.layer = 3;
		this.add(textBG);

		let textFG = new BitmapText({text: "Platformer Demo", x: 1, y: 1, useKerning: true});
		textFG.layer = 3;
		this.add(textFG);
	}

	setup() {
		GFX.getBuffer(0).setCameraFixed(true);
		GFX.getBuffer(0).setAutoCleared(false);
		GFX.getBuffer(3).setCameraFixed(true)

		// layer 0: background is rendered in BASIC mode
		// layer 1 and 2: sprites and tiles are rendered in RAW mode
		// layer 3: text is rendered in BASIC mode (and with fixed camera)
		GFX.getBuffer(0).setRenderMode(Buffer.RenderModes.RAW);
		GFX.getBuffer(1).setRenderMode(Buffer.RenderModes.RAW);
		GFX.getBuffer(2).setRenderMode(Buffer.RenderModes.RAW);
	}
}

export default BaseLevel;