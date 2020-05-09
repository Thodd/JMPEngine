import Screen from "../../../../src/game/Screen.js";
import Entity from "../../../../src/game/Entity.js";
import Tilemap from "../../../../src/game/Tilemap.js";
import Text from "../../../../src/gfx/Text.js";
import RNG from "../../../../src/utils/RNG.js";
import Helper from "../../../../src/utils/Helper.js";
import Player from "../Actors/Player.js";

class BaseLevel extends Screen {
	constructor() {
		super();

		Entity.RENDER_HITBOXES = "#FF0085";

		this.getLayer(0).fixedCam = true; // BG
		this.getLayer(3).fixedCam = true; // Text, e.g. HUD

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
		for (let i = 0; i < 4; i++) {
			let e = new Entity({
				x: RNG.randomInteger(0, 120),
				y: RNG.randomInteger(0, 88)
			});
			e.hitbox.w = 8;
			e.hitbox.h = 8;
			e.setTypes(["box"]);
			e.layer = 4;
			e.setSprite({
				sheet:"tileset",
				id: 9
			});
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
		let textBG = new Text({text: "Platformer Demo", x: 2, y: 2, color: "#000000", useKerning: true});
		textBG.layer = 3;
		this.add(textBG);

		let textFG = new Text({text: "Platformer Demo", x: 1, y: 1, useKerning: true});
		textFG.layer = 3;
		this.add(textFG);
	}
}

export default BaseLevel;