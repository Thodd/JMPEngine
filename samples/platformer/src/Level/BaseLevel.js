import Screen from "../../../../src/game/Screen.js";
import Entity from "../../../../src/game/Entity.js";
import Tilemap from "../../../../src/game/Tilemap.js";
import GFX from "../../../../src/gfx/GFX.js";
import RNG from "../../../../src/utils/RNG.js";

class BaseLevel extends Screen {
	constructor() {
		super();

		this.getLayers(0).fixedCam = true;
		this.getLayers(3).fixedCam = true;

		// background
		let bg = new Entity();
		bg.layer = 0;
		bg.setSprite({
			sheet: "background"
		});
		this.add(bg);

		// basic tilemap
		let t = new Tilemap({
			sheet: "tileset",
			w: 50,
			h: 50
		});
		t.setTypes(["tiles"]);
		t.x = 0;
		t.y = 0;
		t.layer = 1;

		for (let x = 0; x < 16; x++) {
			let tile = t.get(x, 11);
			tile.isBlocking = true;
			tile.set(11);
		}
		this.add(t);

		// tower
		let tile = t.get(10, 10);
		tile.set(11);
		tile.isBlocking = true;

		tile = t.get(10, 9);
		tile.set(11);
		tile.isBlocking = true;

		tile = t.get(10, 8);
		tile.set(11);
		tile.isBlocking = true;

		// demo entities
		for (let i = 0; i < 1; i++) {
			let e = new Entity();
			e.hitbox.w = 8;
			e.hitbox.h = 8;
			e.setTypes(["box"]);
			e.layer = 4;
			e.x = RNG.randomInteger(0, 120);
			e.y = RNG.randomInteger(0, 88);
			e.setSprite({
				sheet:"tileset",
				id: 9
			});
			this.add(e);
		}

		// text
		let text = new Entity();
		text.render = () => {
			GFX.text("font0", 2, 2, "Platformer Demo", 3, "#000000");
			GFX.text("font0", 1, 1, "Platformer Demo", 3, "#FFFFFF");
		};
		this.add(text);
	}
}

export default BaseLevel;