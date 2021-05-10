import PIXI from "../../../../src/core/PIXIWrapper.js";
import { fail } from "../../../../src/utils/Log.js";
import Spritesheets from "../../../../src/assets/Spritesheets.js";
import Entity from "../../../../src/game/Entity.js";

import RLCell from "./RLCell.js";
import RLMapController from "./controller/RLMapController.js";

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
	constructor({
		sheet,
		x=0,
		y=0,
		w=50,
		h=50,
		cellClass=RLCell,
		controllerClass=RLMapController,
		viewport={}
	}) {

		if (!sheet) {
			fail(`The spritesheet ${sheet} does not exist! A Tilemap Entity cannot be created without a spritesheet!`, "Tilemap");
		}

		super(x, y);

		// sheet from which we will render the tiles
		this._sheet = Spritesheets.getSheet(sheet);

		// setup
		this._configure(w, h, cellClass, viewport);
		this._initMap();
		this._initSprites();

		// create an instance of the associated Controller class
		this._controller = new controllerClass(this);

		// call public lifecycle hooks for Map generation & population
		this.generate();
		this._playerActor = this.createPlayerActor();
		this.placePlayer();

		// initialize the controller after the map was fully created
		this._controller.init();
	}

	/**
	 * Mark RLMap as dirty.
	 * Forces a rerender of all tiles at the end of the frame.
	 * @public
	 */
	dirty() {
		this._config.isDirty = true;
	}

	/**
	 * Returns the RLCell at (x,y).
	 * undefined in out of bounds.
	 * @param {int} x x-coordinate
	 * @param {int} y y-coordinate
	 * @returns {RLCell|undefined} the RLCell at (x,y)
	 * @public
	 */
	get(x, y) {
		return this._map[x] && this._map[x][y];
	}

	/**
	 * Iterate all tiles from top-left to bottom-right order.
	 * @param {*} fn callback function, called for each RLCell instance.
	 * @public
	 */
	each(fn) {
		for(let x = 0; x < this._config.w; x++) {
			for (let y = 0; y < this._config.h; y++) {
				fn(this._map[x][y]);
			}
		}
	}

	/**
	 * Returns the RLMapController instance.
	 * @returns {RLMapController}
	 */
	getController() {
		return this._controller;
	}

	/**
	 * JMP Engine update hook.
	 */
	update() {
		// forward the update to the controller
		this._controller.update();
	}

	/**
	 * Hook to generate a map.
	 * @public
	 */
	generate() {}

	/**
	 * Hook to create a player actor.
	 * Optional if no player is needed.
	 * In this case the getPlayerActor() function will return null;
	 * @public
	 */
	createPlayerActor() {}

	/**
	 * Returns the created player actor.
	 * Or null if none was created.
	 * @returns {RLActor|null} the player actor instance or null
	 * @public
	 */
	getPlayerActor() {
		return this._playerActor || null;
	}

	/**
	 * Hook to place the player RLActor instance in the map.
	 * Can also be used to change the player RLActor instance to something else.
	 * Or simply use getPlayerActor() to retrieve the default instance.
	 * @public
	 */
	placePlayer() {}

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
			// dirty flag for optimized rerendering
			isDirty: true
		};

		// copy initially given viewport values
		Object.assign(_config.viewport, initialViewport);

		// We define a public facade for the viewport.
		// This way we make sure that our internal object is not manipulated
		// and we can take care of the dirty checking for rerendering.
		this.viewport = {
			set x(v) {
				_config.isDirty = true;
				_config.viewport.x = v;
			},
			get x() {
				return _config.viewport.x;
			},
			set y(v) {
				_config.isDirty = true;
				_config.viewport.y = v;
			},
			get y() {
				return _config.viewport.y;
			},
			set w(v) {
				_config.isDirty = true;
				_config.viewport.w = v;
			},
			get w() {
				return _config.viewport.w;
			},
			set h(v) {
				_config.isDirty = true;
				_config.viewport.h = v;
			},
			get h() {
				return _config.viewport.h;
			}
		};
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
	 * Initialize the internal sprite pool.
	 * Each sprite represents a single tile on the RLMap.
	 * The viewport size ultimately defines the number of tile sprite created.
	 */
	_initSprites() {
		// Create PIXI Containers
		let pixiMainContainer = new PIXI.Container();
		let pixiTileLayer = new PIXI.Container();
		let pixiBackgroundLayer = new PIXI.Container();
		pixiMainContainer.addChild(pixiBackgroundLayer);
		pixiMainContainer.addChild(pixiTileLayer);

		// Failsafe: remove configSprite function, so it cannot be modified from outside
		this.configSprite({
			replaceWith: pixiMainContainer
		});
		this.configSprite = function() {};

		// Create Sprites for the viewport
		let maxSprites = this.viewport.w * this.viewport.h;
		this._spritesPool = [];
		for (let i = 0; i < maxSprites; i++) {
			let spr = new PIXI.Sprite();
			this._spritesPool.push(spr);
			pixiTileLayer.addChild(spr);
		}

		// create BG graphic, used for rendering Tile background rectangles
		this._backgroundGFX = new PIXI.Graphics();
		pixiBackgroundLayer.addChild(this._backgroundGFX);
	}

	/**
	 * Hook for updating the nested sprites graphics for each tile.
	 * If the RLMap Entity was shifted with via (x,y), the tiles are already correctly
	 * positioned since they are all in the same PIXI.Container.
	 * Only the textures need to be updated now based on the RLMaps viewport.
	 */
	_updateRenderInfos() {
		if (this._config.isDirty) {
			this._backgroundGFX.clear();

			// set the correct texture and position the sprite
			let vpX = this.viewport.x;
			let vpY = this.viewport.y;
			let vpW = this.viewport.w;
			let vpH = this.viewport.h;
			let i = 0;
			for (let x = 0; x < vpW; x++) {
				for (let y = 0; y < vpH; y++) {
					// get sprite from pool and update texture
					let spr = this._spritesPool[i];

					// we just make everything invisible at first,
					// this way we don't have left-over tiles outside the viewport
					spr.visible = false;

					// position sprite on screen
					spr.x = x * this._sheet.w;
					spr.y = y * this._sheet.h;

					// get cell, make sure to not go out of bounds
					let cell = this._map[vpX+x] ? this._map[vpX+x][vpY+y] : undefined;
					if (cell) {
						let cellRenderInfo = cell._renderInfo;
						// we check if there is an Actor on the Cell AND if it's visible
						let actor = cell.getTopActor();
						let actorRenderInfo = actor && actor.isVisible ? actor._renderInfo : {};

						let id = actorRenderInfo.id || cellRenderInfo.id;
						let color = actorRenderInfo.color || cellRenderInfo.color;
						let background = actorRenderInfo.background || cellRenderInfo.background;

						// update tile texture
						spr.visible = true;
						spr.texture = this._sheet.textures[id];

						// FG coloring
						spr.tint = color;

						// draw BG if needed
						if (background) {
							this._backgroundGFX.beginFill(background);
							this._backgroundGFX.drawRect(spr.x, spr.y, this._sheet.w, this._sheet.h);
							this._backgroundGFX.endFill();
						}
					}

					i++;
				}
			}

			this._config.isDirty = false;
		}
	}
}

export default RLMap;