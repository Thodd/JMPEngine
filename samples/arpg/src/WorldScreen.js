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
import DropSystem from "./actors/drops/DropSystem.js";
class WorldScreen extends Screen {
	constructor() {
		super();

		EventBus.subscribe(Constants.Events.UPDATE_UI, this.updateUI.bind(this));

		OverworldGenerator.generate();
		//this.add(OverworldGenerator.minimap);

		Tileset.init();

		// initialiaze DropSystem. One instance per map screen.
		this._dropSystem = new DropSystem(this);

		MapLoader.load({
			"sampleMap": { url: "./maps/testing/testing.json" }
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

				// set tile type & visuals
				tile.change(tileId);

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

			this.setupUI();
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

	getDropSystem() {
		return this._dropSystem;
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

	setupUI() {
		// Hearts are rendered as a BitmapText for simplicity
		this.hearts = new BitmapText({
			font: "hearts",
			text: `a a a b c c`,
			x: -1,
			y: -3
		});
		this.hearts.layer = Constants.Layers.UI;
		this.add(this.hearts);

		// initial render of hearts
		this.updateHearts();

		this.addDebugUI();
	}

	updateUI() {
		this.updateHearts();
	}

	updateHearts() {
		// render Hearts
		// OK so this is a bit janky but works just fine :)
		// The player might be "overkilled" but we still want to render an empty hearts-bar
		if (PlayerState.stats.hp > 0) {
			let hearts = "";
			let playerHP = PlayerState.stats.hp | 0;
			let playerHP_half = PlayerState.stats.hp - playerHP > 0;
			let playerHP_Max_Delta = PlayerState.stats.hp_max - playerHP;

			// full hearts
			for (let i = 0; i < playerHP; i++) {
				hearts += "a ";
			}

			// 1 or 0 half hearts
			playerHP_half ? (hearts += "b ") : undefined;

			// empty hearts
			for (let i = playerHP_half ? 1 : 0; i < playerHP_Max_Delta; i++) {
				hearts += "c ";
			}

			this.hearts.setText(hearts);
		} else {
			// empty hearts
			let hearts = "";
			for (let i = 0; i < PlayerState.stats.hp_max; i++) {
				hearts += "c ";
			}
			this.hearts.setText(hearts);
		}
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