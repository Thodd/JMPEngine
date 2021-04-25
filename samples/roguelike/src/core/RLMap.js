import PIXI from "../../../../src/core/PIXIWrapper.js";
import { fail, warn } from "../../../../src/utils/Log.js";
import Spritesheets from "../../../../src/assets/Spritesheets.js";
import Entity from "../../../../src/game/Entity.js";

/**
 * Responsible for rendering a roguelike optimized Tilemap.
 * Optimized for rendering colored Tiles with dedicated background color per tile.
 *
 * BEWARE:
 * This Class is not intended to be used together with the global Engine camera!
 * Make sure that your game has a fixed global camera, and only the RLMaps viewport
 * is used for scrolling.
 */
class RLMap extends Entity {
	constructor({sheet, x=0, y=0}) {

		if (!sheet) {
			fail(`The spritesheet ${sheet} does not exist! A Tilemap Entity cannot be created without a spritesheet!`, "Tilemap");
		}

		super(x, y);

		// @PIXI: Destroy the initial pixi sprite created by the super Entity constructor, shouldn'tile be much of an issue
		this._pixiSprite.destroy();

		// create a continer for all single tile sprites
		this._pixiSprite = new PIXI.Container();

		// sheet from which we will render the tiles
		this._sheet = Spritesheets.getSheet(sheet);
	}

	each() {

	}

	/**
	 * Not supported for Tilemaps.
	 */
	configSprite() {
		warn("configSprite is not supported for Tilemaps. Please use 'Tilemap.setTilesheet()'.", "Tilemap");
	}

	/**
	 * Hook for updating the nested sprites graphics for each tile.
	 * If the RLMap Entity was shifted with via (x,y), the tiles are already correctly
	 * positioned since they are all in the same PIXI.Container.
	 * Only the textures need to be updated now based on the RLMaps viewport.
	 */
	_updateRenderInfos() {
		if (this._map && this._map._isDirty) {
			// TODO: update PIXI sprites based on map viewport
		}
	}
}

export default RLMap;