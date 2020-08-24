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

		//Entity.RENDER_HITBOX = 0xFF0000;

		/**
		 * Tilemap demo
		 */
		this._tilemap = new Tilemap({
			sheet: "tileset",
			w: Constants.MAP_WIDTH,
			h: Constants.MAP_HEIGHT
		});
		this._tilemap.setTypes(["tiles"]);
		this._tilemap.layer = LAYERS.Tiles;

		this._tilemap.each((tile) => {
			tile.set(Helper.choose([0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 243, 6, 7]));
		});

		this._tilemap.set(10, 10, 280);
		this._tilemap.get(10, 10).isBlocking = true;

		this.add(this._tilemap);

		/**
		 * player
		 */
		this.player = new Player(this.width / 2, this.height / 2);
		this.player.layer = LAYERS.Player;
		this.add(this.player);

		this.addText();

		this.centerCameraAround(this.player);
	}

	setup() {
		// fix UI layer camera so it's not scrolled out of view
		this.setCameraFixedForLayer(LAYERS.UI, true);
	}

	centerCameraAround(e){
		this.cam.x = e.x - (this.width / 2);
		this.cam.y = e.y - (this.height / 2);
	}

	getTilemap() {
		return this._tilemap;
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
			font: "font0",
			text: `UI goes here!`,
			color: 0x333333,
			x: 4,
			y: 4
		});
		textShadow.layer = LAYERS.UI;
		this.add(textShadow);
	}

	update() {}

	endOfFrame() {
		this.centerCameraAround(this.player);
	}

}

export default WorldScreen;