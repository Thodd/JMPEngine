// Engine imports
import Screen from "../../../src/game/Screen.js";
import BitmapText from "../../../src/game/BitmapText.js";
import Tilemap from "../../../src/game/Tilemap.js";
import { exposeOnWindow } from "../../../src/utils/Helper.js";
import EventBus from "../../../src/utils/EventBus.js";

// logic
import Constants from "./Constants.js";
import PlayerState from "./actors/PlayerState.js";

// tilemap & mapgen
import Tileset from "./mapgen/Tileset.js";
import GameTile from "./mapgen/GameTile.js";
import MapLoader from "./mapgen/MapLoader.js";
import OverworldGenerator from "./mapgen/overworld/OverworldGenerator.js";

// object types
import Player from "./actors/Player.js";
import Sign from "./actors/interactables/Sign.js";
import ObjectTypes from "./mapgen/ObjectTypes.js";
import EnemyTypes from "./actors/enemies/EnemyTypes.js";
import { log } from "../../../src/utils/Log.js";
class WorldScreen extends Screen {
	constructor() {
		super();

		OverworldGenerator.generate();
		//this.add(OverworldGenerator.minimap);

		Tileset.init();

		EventBus.subscribe(Constants.Events.UPDATE_UI, this.updateUI.bind(this));

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

			// The constructor calls are "yolo" since the MapLoader has made a sanity check on each loaded Map file.
			// If something fails here the MapLoader has a bug :)
			mapData.objects.forEach((obj) => {
				if (obj.type === ObjectTypes.SIGN) {
					this.add(new Sign(obj.x, obj.y, obj["msg"]));
				} else if (obj.type === ObjectTypes.ENEMY) {

					let EnemyClass = EnemyTypes[obj.name];
					this.add(new EnemyClass(obj.x, obj.y));
				}
			});

			// player
			this.player = new Player(this.width / 2 + Constants.TILE_WIDTH, this.height / 2 + Constants.TILE_HEIGHT*2);
			this.add(this.player);
			exposeOnWindow("player", this.player);

			this.centerCameraAround(this.player);

			this.addDebugUI();
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

	addDebugUI() {
		this.uiText = new BitmapText({
			font: "font0",
			text: `pt: ???`,
			leading: 3,
			color: 0xff0000,
			x: 4,
			y: this.getHeight() - 12
		});
		this.uiText.layer = Constants.Layers.UI;
		this.add(this.uiText);
	}

	update() {}

	updateUI() {
		// render Hearts

		// TODO: Render Hearts
		// TODO: Use Hearts as a BitmapText --> no pool needed... :D

		// for (let i = 0; i < 4; i++) {
		// 	let heart = new Entity(i*14, 0);
		// 	heart.layer = Constants.Layers.UI;
		// 	heart.configSprite({
		// 		sheet: "UI",
		// 		id: 2
		// 	});
		// 	this.add(heart);
		// }
		log(`Player HP: ${PlayerState.stats.hp}`);
	}

	endOfFrame() {
		// we can only do this if the placer is present after map loading
		if (this.player) {
			this.centerCameraAround(this.player);

			let playerTile = this.player.getClosestTile();
			this.uiText.setText(`pt: ${playerTile.id}`);
		}
	}

	// setDaylight() {
	// 	if (!this._skyNight) {
	// 		this._skyNight = new Entity();
	// 		this._skyNight.layer = Constants.Layers.SKY;

	// 		let g = new PIXI.Graphics();
	// 		g.beginFill(0x11304e, 0.5); //eda867
	// 		g.drawRect(0, 0, this.width, this.height);
	// 		g.endFill();
	// 		this._skyNight.configSprite({
	// 			replaceWith: g
	// 		});

	// 		this.add(this._skyNight);
	// 	}
	// }

}

export default WorldScreen;