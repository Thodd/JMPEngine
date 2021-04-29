import PIXI from "../../../../src/core/PIXIWrapper.js";
import { fail, warn } from "../../../../src/utils/Log.js";
import Spritesheets from "../../../../src/assets/Spritesheets.js";
import Entity from "../../../../src/game/Entity.js";

import RLCell from "./RLCell.js";

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
	constructor({sheet, x=0, y=0, w=50, h=50, cellClass=RLCell, viewport={}}) {

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

		// Map setup
		this._configure(w, h, cellClass, viewport);
		this._initMap();
	}

	/**
	 * Process the RLMap's initial config.
	 * Creates a Viewport façade.
	 */
	_configure(w, h, cellClass, initialViewport) {
		// private config
		const _config = this._config = {
			w: w,
			h: h,
			cellClass: cellClass,
			viewport: {
				x: 0,
				y: 0,
				w: 10,
				h: 10
			},
			isDirty: false
		};

		// copy initially given viewport values
		Object.assign(_config.viewport, initialViewport);

		// We define a public facade for the viewport.
		// This way we make sure that our internal object is not manipulated
		// and we can take care of the dirty checking for rerendering.
		this.viewport = {
			set x(v) {
				v = Math.max(v, 0);
				_config.isDirty = true;
				_config.viewport.x = v;
			},
			get x() {
				return _config.viewport.x;
			},
			set y(v) {
				v = Math.max(v, 0);
				_config.isDirty = true;
				_config.viewport.y = v;
			},
			get y() {
				return _config.viewport.y;
			},
			set w(v) {
				v = Math.max(v, 0);
				_config.isDirty = true;
				_config.viewport.w = v;
			},
			get w() {
				return _config.viewport.w;
			},
			set h(v) {
				v = Math.max(v, 0);
				_config.isDirty = true;
				_config.viewport.h = v;
			},
			get h() {
				return _config.viewport.h;
			}
		};
	}

	/**
	 * Mark RLMap as dirty.
	 * Forces a rerender of all tiles at the end of the frame.
	 */
	dirty() {
		this._config.isDirty = true;
	}

	/**
	 * Iterate all tiles from top-left to bottom-right order.
	 * @param {*} fn callback function, called for each RLCell instance.
	 */
	each(fn) {
		for(let x = 0; x < this._config.w; x++) {
			for (let y = 0; y < this._config.h; y++) {
				fn(this._map[x][y]);
			}
		}
	}

	/**
	 * Not supported.
	 */
	configSprite() {
		warn("configSprite is not supported for RLMaps. Tileset can only be configured initially via the constructor.", "RLMap");
	}

	/**
	 * Initialize the map and create all RLCell instances.
	 */
	_initMap() {
		this._map = [];
		for(let x = 0; x < this._config.w; x++) {
			this._map[x] = [];
			for (let y = 0; y < this._config.h; y++) {
				this._map[x][y] = new this._config.cellClass(this, x, y);
			}
		}
	}

	/**
	 * Hook for updating the nested sprites graphics for each tile.
	 * If the RLMap Entity was shifted with via (x,y), the tiles are already correctly
	 * positioned since they are all in the same PIXI.Container.
	 * Only the textures need to be updated now based on the RLMaps viewport.
	 */
	_updateRenderInfos() {
		if (this._isDirty) {
			// TODO: update PIXI sprites based on map viewport
		}
	}
}

export default RLMap;