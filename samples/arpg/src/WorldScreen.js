import PIXI from "../../../src/core/PIXIWrapper.js";
import Screen from "../../../src/game/Screen.js";
import Entity from "../../../src/game/Entity.js";
import BitmapText from "../../../src/game/BitmapText.js";
import Tilemap from "../../../src/game/Tilemap.js";
import { exposeOnWindow } from "../../../src/utils/Helper.js";

import Constants from "./Constants.js";

import Tileset from "./mapgen/Tileset.js";
import GameTile from "./mapgen/GameTile.js";
import MapLoader from "./mapgen/MapLoader.js";
import OverworldGenerator from "./mapgen/overworld/OverworldGenerator.js";

// object types
import Player from "./actors/Player.js";
import Sign from "./actors/interactables/Sign.js";
import Enemy from "./actors/enemies/Enemy.js";
class WorldScreen extends Screen {
	constructor() {
		super();

		OverworldGenerator.generate();
		//this.add(OverworldGenerator.minimap);

		Tileset.init();

		MapLoader.load({
			"sampleMap": { url: "./maps/center/center_00.json" }
		}).then((maps) => {
			// create the tilemap
			this._tilemap = new Tilemap({
				sheet: "tileset",
				w: Constants.MAP_WIDTH,
				h: Constants.MAP_HEIGHT,
				tileClass: GameTile
			});
			this._tilemap.setTypes(["tiles"]);
			this._tilemap.layer = Constants.Layers.TILES;
			this.add(this._tilemap);

			// place tiles into tilemap
			let mapData = maps["sampleMap"];
			let globalIndex = 0;
			this._tilemap.each((tile) => {
				// The mapeditor "Tiled" adds 1 to the tile-id, 0 is empty.
				// However the JMP Engine regards 0 as the first tile and -1 as empty.
				let tileId = mapData.tiles[globalIndex] - 1;

				// set visuals
				tile.set(tileId);

				// check if the tile has a hitbox defined in the tileset
				tile._hitbox = Tileset.getProperties(tileId).hitbox;

				globalIndex++;
			});

			// create objects
			mapData.objects.forEach((obj) => {
				switch(obj.type) {
					case "Sign": this.add(new Sign(obj.x, obj.y, obj["msg"])); break;
					case "Enemy": this.add(new Enemy(obj.x, obj.y)); break;
				}

			});

			// player
			this.player = new Player(this.width / 2 + Constants.TILE_WIDTH, this.height / 2 + Constants.TILE_HEIGHT*2);
			this.add(this.player);
			exposeOnWindow("player", this.player);

			// some sample text
			this.addText();

			// init daylight
			//this.setDaylight();

			this.centerCameraAround(this.player);
		});
	}

	setup() {
		// fix UI layer camera so it's not scrolled out of view
		this.setCameraFixedForLayer(Constants.Layers.UI, true);
		// same for the sky overlay
		this.setCameraFixedForLayer(Constants.Layers.SKY, true);
	}

	centerCameraAround(e){
		this.cam.x = e.x - (this.width / 2);
		this.cam.y = e.y - (this.height / 2);
	}

	getPlayer() {
		return this.player;
	}

	getTilemap() {
		return this._tilemap;
	}

	addText() {
		// background
		let g2 = new PIXI.Graphics();
		g2.beginFill(0xfdf0d1);
		g2.drawRect(0, 0, this.width, Constants.TILE_HEIGHT);
		g2.endFill();
		let e2 = new Entity();
		e2.active = false; // no update needed
		e2.layer = Constants.Layers.UI;
		e2.configSprite({
			replaceWith: g2
		});
		this.add(e2);

		this.uiText = new BitmapText({
			font: "font0",
			text: `pt: ???`,
			leading: 3,
			color: 0xff0000,
			x: 4,
			y: 4
		});
		this.uiText.layer = Constants.Layers.UI;
		this.add(this.uiText);
	}

	setDaylight() {
		if (!this._skyNight) {
			this._skyNight = new Entity();
			this._skyNight.layer = Constants.Layers.SKY;

			let g = new PIXI.Graphics();
			g.beginFill(0x11304e, 0.5); //eda867
			g.drawRect(0, 0, this.width, this.height);
			g.endFill();
			this._skyNight.configSprite({
				replaceWith: g
			});

			this.add(this._skyNight);
		}
	}

	update() {}

	endOfFrame() {
		// we can only do this if the placer is present after map loading
		if (this.player) {
			this.centerCameraAround(this.player);

			let playerTile = this.player.getClosestTile();
			this.uiText.setText(`pt: ${playerTile.id}`);
		}
	}

}

export default WorldScreen;