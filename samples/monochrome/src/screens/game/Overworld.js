// JMP Engine imports
import RNG from "../../../../../src/utils/RNG.js";
import Helper from "../../../../../src/utils/Helper.js";

// Game Imports
import BaseMap from "./BaseMap.js";

import Constants from "../../Constants.js";
import GameTileTypes from "../../levelgen/GameTileTypes.js";
import GameTile from "../../levelgen/GameTile.js";

import Snake from "../../actors/enemies/Snake.js";
import Wolf from "../../actors/enemies/Wolf.js";
import Bear from "../../actors/enemies/Bear.js";

import ItemTypes from "../../items/ItemTypes.js";
import Algos from "../../utils/Algos.js";
import EffectPool from "../../animations/effects/EffectPool.js";
import TileHighlight from "../../animations/effects/TileHighlight.js";
import BitmapText from "../../../../../src/game/BitmapText.js";

class WorldScreen extends BaseMap {
	constructor() {
		super({
			sheet: "tileset",
			w: Constants.MAP_WIDTH,
			h: Constants.MAP_HEIGHT,
			tileClass: GameTile
		});
	}

	generate() {
		this._tileMap.each((tile) => {
			let rnd = RNG.random();
			let tileType;
			if (rnd < 0.05) {
				tileType = GameTileTypes.TREE;
			} else if (rnd < 0.1) {
				tileType = GameTileTypes.BUSH;
			} else {
				tileType = GameTileTypes.FLOOR;
			}
			tile.setType(tileType);
		});
		this._tileMap.get(12,12).setType(GameTileTypes.TREE);
		this._tileMap.get(14,12).setType(GameTileTypes.TREE);
		this._tileMap.get(10,8).setType(GameTileTypes.SIGN);

		this._tileMap.get(12,8).setType(GameTileTypes.BUSH);
		this._tileMap.get(13,8).setType(GameTileTypes.BUSH);
		this._tileMap.get(14,8).setType(GameTileTypes.BUSH);
	}

	populate() {
		// some enemies
		for (let i = 0; i < 5; i++) {
			let EnemyClass = Helper.choose([Snake, Wolf, Bear]);
			this.enemy = new EnemyClass({gameTile: this._tileMap.get(7, 7)});
			this.add(this.enemy);
			this._gameController.getTimeline().addActor(this.enemy);
		}

		let bmp = new BitmapText({
			text: "The bork is overgrown with moss.\nLooks like it can be cut down rather easily.",
			font: "font0",
			x: 20,
			y: 20
		});
		this.add(bmp);
	}

	positionPlayer() {
		// place the Player on the correct start-tile
		let startTile = this.getTilemap().get(10, 10);
		this.getPlayer().placeOnTile(startTile);
	}

	begin() {
		super.begin();
		this.getPlayer().getTileRelative(-1, -1).dropNewItem(ItemTypes.SPEAR);

		this.getPlayer().getTileRelative(-1, 0).dropNewItem(ItemTypes.THROWING_KNIFES);
		this.getPlayer().getTileRelative(-1, 0).dropNewItem(ItemTypes.THROWING_KNIFES);
		this.getPlayer().getTileRelative(-1, 0).dropNewItem(ItemTypes.THROWING_KNIFES);
		this.getPlayer().getTileRelative(-1, 0).dropNewItem(ItemTypes.THROWING_KNIFES);
		this.getPlayer().getTileRelative(-1, 0).dropNewItem(ItemTypes.THROWING_KNIFES);

		this.getPlayer().getTileRelative(+1, 0).dropNewItem(ItemTypes.BOW);
		this.getPlayer().getTileRelative(+1, 1).dropNewItem(ItemTypes.JAVELIN);
		this.getPlayer().getTileRelative(+1, 2).dropNewItem(ItemTypes.PISTOL);

		this.getPlayer().getTileRelative(-1, 3).dropNewItem(ItemTypes.APPLE);
		this.getPlayer().getTileRelative(-1, 4).dropNewItem(ItemTypes.BANANA);
		this.getPlayer().getTileRelative(-1, 5).dropNewItem(ItemTypes.ORANGE);
		this.getPlayer().getTileRelative(-1, 6).dropNewItem(ItemTypes.WATERMELON);
		this.getPlayer().getTileRelative(-1, 7).dropNewItem(ItemTypes.GRAPES);
		this.getPlayer().getTileRelative(-1, 8).dropNewItem(ItemTypes.CHERRIES);
		this.getPlayer().getTileRelative(-1, 9).dropNewItem(ItemTypes.MEAT);
	}

}

export default WorldScreen;