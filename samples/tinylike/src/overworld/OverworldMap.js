// JMP imports
import { log } from "../../../../../../src/utils/Log.js";

// core imports
import RLMap from "../core/RLMap.js";

// engine imports
import { xx, yy } from "../engine/utils/RLTools.js";
import Tile from "../engine/tiling/Tile.js";
import ItemBase from "../engine/actors/ItemBase.js";

// content imports
import Constants from "../gamecontent/Constants.js";
import TileTypes from "../gamecontent/tiling/TileTypes.js";
import Weapons from "../gamecontent/items/Weapons.js";
import Player from "../gamecontent/actors/player/Player.js";
import Rat from "../gamecontent/actors/enemies/Rat.js";

// own imports
import OverworldController from "./OverworldController.js";
import RoomLayoutGenerator from "./levelgen/RoomLayoutGenerator.js";

class OverworldMap extends RLMap {
	constructor() {
		super({
			sheet: "tileset",

			cellClass: Tile,

			controllerClass: OverworldController,

			// position on screen
			x: xx(0),
			y: yy(1),

			// the RLMap's maximum dimensions are calculated based on the room count and the viewport size
			w: Constants.VIEWPORT_WIDTH * Constants.OVERWORLD_ROOM_COLUMNS,
			h: Constants.VIEWPORT_HEIGHT * Constants.OVERWORLD_ROOM_ROWS,

			viewport: {
				x: 0,
				y: 0,
				w: Constants.VIEWPORT_WIDTH,
				h: Constants.VIEWPORT_HEIGHT
			}
		});

		// debugging logs, helpful to see the dimensions of the generated map
		log("generated.", "Overworld");
		log(`Map dimensions (in Rooms): w=${Constants.OVERWORLD_ROOM_COLUMNS}, h=${Constants.OVERWORLD_ROOM_ROWS}.`, "Overworld");
		log(`Map dimensions (in tiles): w=${this._config.w}, h=${this._config.h}.`, "Overworld");
		log(`Viewport dimensions (in tiles): w=${Constants.VIEWPORT_WIDTH}, h=${Constants.VIEWPORT_HEIGHT}.`, "Overworld");
	}

	/**
	 * Generate Overworld.
	 * @override
	 */
	generate() {
		// create a random room layout
		this.roomLayoutGenerator = new RoomLayoutGenerator(this, Constants.OVERWORLD_ROOM_COLUMNS, Constants.OVERWORLD_ROOM_ROWS);
		this.roomLayoutGenerator.generate();

		// TODO: Make this based on the room list, NOT the complete map
		// fill with tiles
		this.each((tile) => {
			let r = Math.random();
			if (r < 0.05) {
				tile.setType(TileTypes.TREE);
			} else {
				tile.setType(TileTypes.FLOOR);
			}
		});

		// TODO: create actors
		let timeline = this.getController().getTimeline();

		// v--- DEBUGGING and Testing actors ---v
		let centerRoom = this.roomLayoutGenerator.getCenterRoom();

		let ratEnemy = new Rat();
		timeline.add(ratEnemy);
		this.get(centerRoom.dimensions.x_min + 16, centerRoom.dimensions.y_min + 15).addActor(ratEnemy);

		let ratEnemy2 = new Rat();
		timeline.add(ratEnemy2);
		this.get(centerRoom.dimensions.x_min + 14, centerRoom.dimensions.y_min + 15).addActor(ratEnemy2);

		// items
		let weaponItem = new ItemBase(Weapons.THROWING_KNIVES);
		this.get(centerRoom.dimensions.x_min + 16, centerRoom.dimensions.y_min + 18).addActor(weaponItem);
		let weaponItem2 = new ItemBase(Weapons.KITCHEN_KNIFE);
		this.get(centerRoom.dimensions.x_min + 16, centerRoom.dimensions.y_min + 19).addActor(weaponItem2);
		let weaponItem3 = new ItemBase(Weapons.WRENCH);
		this.get(centerRoom.dimensions.x_min + 16, centerRoom.dimensions.y_min + 20).addActor(weaponItem3);
		let weaponItem4 = new ItemBase(Weapons.AXE);
		this.get(centerRoom.dimensions.x_min + 16, centerRoom.dimensions.y_min + 21).addActor(weaponItem4);
		let weaponItem5 = new ItemBase(Weapons.METAL_ROD);
		this.get(centerRoom.dimensions.x_min + 16, centerRoom.dimensions.y_min + 22).addActor(weaponItem5);
	}

	/**
	 * Create a simple player actor.
	 * @override
	 * @returns {RLActor} the player actor instance
	 */
	createPlayerActor() {
		return new Player();
	}

	/**
	 * Place the player on the Overworld for the first time.
	 * @override
	 */
	placePlayer() {
		let centerRoom = this.roomLayoutGenerator.getCenterRoom();
		let dim = centerRoom.dimensions;

		// place player in their first room
		let player = this.getPlayerActor();
		player.setRoom(centerRoom);

		// place player in the overall map
		this.get(dim.x_min + 15, dim.y_min + 15).addActor(player);

		// initial viewport is in the centerRoom of the world map
		this.viewport.x = dim.x_min;
		this.viewport.y = dim.y_min;
	}
}

export default OverworldMap;