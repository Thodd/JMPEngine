import Manifest from "../../../src/Manifest.js";
import Screen from "../../../src/game/Screen.js";
import Entity from "../../../src/game/Entity.js";
import RNG from "../../../src/utils/RNG.js";
import Helper from "../../../src/utils/Helper.js";
import GFX from "../../../src/gfx/GFX.js";
import Buffer from "../../../src/gfx/Buffer.js";
import Tilemap from "../../../src/game/Tilemap.js";

const screenWidth = Manifest.get("/w");
const screenHeight = Manifest.get("/h");

class Fruit extends Entity {
	constructor() {
		super({});

		this.layer = 1;

		this.xDir = Helper.choose([-1, 1]);
		this.yDir = Helper.choose([-1, 1]);

		this.setSprite({
			sheet: "fruits",
			id: RNG.randomInteger(0, 6)
		});
	}

	added() {
		this.x = Math.max(0, Math.floor(Math.random() * screenWidth) - 8);
		this.y = Math.max(0, Math.floor(Math.random() * screenHeight) - 8);
	}

	update() {
		this.x += this.xDir * 1;
		this.y += this.yDir * 1;

		if (this.x < 0 || this.x + 8 > screenWidth) {
			this.xDir *= -1;
		}

		if (this.y < 0 || this.y + 8 > screenHeight) {
			this.yDir *= -1;
		}
	}
}

class Fruitmark extends Screen {
	constructor() {
		super();

		let t = new Tilemap({sheet: "fruits", w: 40, h: 40, version: "B"});
		t.each((tile) => {
			tile.set(2);
		})
		this.add(t);

		for (let i = 0; i < 2000; i++) {
			this.add(new Fruit({}));
		}
	}

	setup() {
		GFX.getBuffer(1).setRenderMode(Buffer.RenderModes.RAW);
	}
}

export default Fruitmark;