import Screen from "../../../src/game/Screen.js";
import Entity from "../../../src/game/Entity.js";
import Tilemap from "../../../src/game/Tilemap.js";
import Helper from "../../../src/utils/Helper.js";
import BitmapText from "../../../src/game/BitmapText.js";

import Constants from "./Constants.js";
import Player from "./actors/Player.js";
import PIXI from "../../../src/core/PIXIWrapper.js";

const LAYERS = {
	Tiles: 0,
	Enemies: 1,
	Player: 2,
	UI: 6
};

class WorldScreen extends Screen {
	constructor() {
		super();

		Entity.RENDER_HITBOX = 0xFF0000;

		/**
		 * Tilemap demo
		 */
		let tm = new Tilemap({
			sheet: "tileset",
			w: Constants.MAP_WIDTH,
			h: Constants.MAP_HEIGHT
		});
		tm.layer = LAYERS.Tiles;

		tm.each((tile) => {
			tile.set(Helper.choose([0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 243, 6, 7]));
		});

		this.add(tm);

		/**
		 * player
		 */
		this.player = new Player(this.width / 2, this.height / 2);
		this.player.layer = LAYERS.Player;
		this.add(this.player);

		this.centerCameraAround(this.player);

		this.addText();
	}

	setup() {
		// fix UI layer camera so it's not scrolled out of view
		this.setCameraFixedForLayer(LAYERS.UI, true);
	}

	centerCameraAround(e){
		this.cam.x = e.x - (this.width / 2);
		this.cam.y = e.y - (this.height / 2);
	}

	addText() {
		// background
		let g = new PIXI.Graphics();
		g.beginFill(0xfdf0d1);
		g.drawRect(0, 0, this.width, 16);
		g.endFill();
		let e = new Entity();
		e.active = false; // no update needed
		e.layer = LAYERS.UI;
		e.configSprite({
			replaceWith: g
		});

		this.add(e);

		let textShadow = new BitmapText({
			font: "vfr95_base",
			text: `UI goes here!`,
			color: 0x333333,
			x: 4,
			y: 4
		});
		textShadow.layer = LAYERS.UI;
		this.add(textShadow);
	}

	update() {}

}

export default WorldScreen;