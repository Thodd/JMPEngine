import { fail } from "../utils/Log.js";

class Tile {
	/**
	 *
	 * @param {Tilemap} tilemap the Tilemap instance this Tile instance belongs to
	 * @param {number} x the x coordinate of this Tile instance inside its Tilemap
	 * @param {number} y the x coordinate of this Tile instance inside its Tilemap
	 */
	constructor({tilemap=null, x=0, y=0}={}) {
		if (tilemap == null) {
			fail("Tile cannot be created without a tilemap.", "Tile");
		}

		this.tilemap = tilemap;
		this.x = x;
		this.y = y;
		this.id = -1;

		/**
		 * Whether the tile takes part in a collision detection on the tilemap.
		 * Default is false.
		 */
		this.isBlocking = false;

		/**
		 * Animation infos.
		 * Simple animation with only one time step.
		 * We do this manually so we don't need a FrameCounter
		 * for every animated Tile instance... that would be a bit much.
		 */
		this._animInfo = {
			frames: null,
			dt: 0,
			count: 0,
			index: 0
		};
	}

	get screenX() {
		return this.x * this.tilemap._tileWidth;
	}

	get screenY() {
		return this.y * this.tilemap._tileHeight;
	}

	getTilemap() {
		return this.tilemap;
	}

	/**
	 * Sets the tile ID for this instance.
	 * @param {number} [id=-1] the tile ID which should be set. If none given the tile is cleared (tileID = -1)
	 * @param {boolean} [isAnimationUpdate=false] a flag which signifies if the set call comes from an animation update.
	 *                                            Can be checked in subclasses.
	 *                                            Unused in base implementation!
	 */
	set(id=-1, isAnimationUpdate=false) {
		isAnimationUpdate; // unused in base implementation
		this.id = id;
	}

	/**
	 * Sets the animation for this Tile instance.
	 * Only one animation per tile is supported at a fixed delta-time.
	 * The given key-frames are Tile IDs in the tileset of the corresponding Tilemap instance.
	 *
	 * @param {object|null} specs specification for the animation.
	 *                            If null is given, the animation is stopped.
	 *                            The last set key-frame will stay as the tile ID.
	 * @param {int[]} specs.frames mandatory array containing the animation key-frames IDs. Must be an array.
	 * @param {int} [specs.dt=0] the delta-time between each key-frame
	 */
	setAnimation(specs) {
		if (specs == null) {
			this._animInfo.isAnimated = false;
			return;
		}

		this._animInfo = {
			isAnimated: true,
			synchronize: specs.synchronize || false,
			frames: specs.frames,
			dt: specs.dt || 0,
			frameCount: 0,
			index: 0
		};
		this.set(this._animInfo.frames[0], true);
	}

	/**
	 * Retrieves the tile at the given relative coordinates.
	 *
	 * @param {int} dx delta x, default: 0
	 * @param {int} dy delta y, default: 0
	 */
	getRelative(dx=0, dy=0) {
		return this.tilemap.get(this.x + dx, this.y + dy);
	}
}

export default Tile;