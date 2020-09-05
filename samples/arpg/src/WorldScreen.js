import PIXI from "../../../src/core/PIXIWrapper.js";
import Screen from "../../../src/game/Screen.js";
import Entity from "../../../src/game/Entity.js";
import BitmapText from "../../../src/game/BitmapText.js";
import Tilemap from "../../../src/game/Tilemap.js";

import Tileset from "./mapgen/Tileset.js";
import GameTile from "./mapgen/GameTile.js";
import MapLoader from "./mapgen/MapLoader.js";
import Player from "./actors/Player.js";
import Constants from "./Constants.js";

class WorldScreen extends Screen {
	constructor() {
		super();

		//Entity.RENDER_HITBOX = 0xFF0000;

		Tileset.init();

		MapLoader.load({
			"sampleMap": { url: "./maps/town.json" } //tile_animation_tests, center_corners_free
		}).then((maps) => {
			// create the tilemap
			this._tilemap = new Tilemap({
				sheet: "tileset",
				w: 25,
				h: 25,
				tileClass: GameTile
			});
			this._tilemap.setTypes(["tiles"]);
			this._tilemap.layer = Constants.Layers.TILES;
			this.add(this._tilemap);

			// place tiles into tilemap
			let mapData = maps["sampleMap"];
			let globalIndex = 0;
			this._tilemap.each((tile) => {
				// The Tiled editor adds 1 to the tile-id, 0 is empty.
				// However the JMP Engine regards 0 as the first tile and -1 as empty.
				let tileId = mapData.tiles[globalIndex] - 1;

				// set visuals
				tile.set(tileId);

				globalIndex++;
			})

			// player
			this.player = new Player(this.width / 2 + Constants.TILE_WIDTH, this.height / 2 + Constants.TILE_HEIGHT*2);
			this.add(this.player);

			// some sample text
			this.addText();

			this.centerCameraAround(this.player);
		});
	}

	setup() {
		// fix UI layer camera so it's not scrolled out of view
		this.setCameraFixedForLayer(Constants.Layers.UI, true);
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
		g.drawRect(0, 0, this.width, Constants.TILE_HEIGHT);
		g.endFill();
		let e = new Entity();
		e.active = false; // no update needed
		e.layer = Constants.Layers.UI;
		e.configSprite({
			replaceWith: g
		});

		this.add(e);

		let textShadow = new BitmapText({
			font: "font0",
			text: `       *  Top-down Sample Adventure  *`,
			color: 0x000000,
			x: 4,
			y: 4
		});
		textShadow.layer = Constants.Layers.UI;
		this.add(textShadow);
	}

	update() {}

	endOfFrame() {
		// we can only do this if the placer is present after map loading
		if (this.player) {
			this.centerCameraAround(this.player);
		}
	}

}

export default WorldScreen;