import { warn } from "../../../../../src/utils/Log.js";
import Actor from "../Actor.js";
import Constants from "../../Constants.js";
import Tileset from "../../mapgen/Tileset.js";

class TileBasedEffect extends Actor {
	constructor(actor) {
		super();
		this.actor = actor;

		// animations
		// we don't use the animation system, as it is based on player movement and not time...
		this.animations = {
			stepcount: 0,
			index: 0,
			grass: {
				layer: Constants.Layers.PLAYER_OVER,
				offset: {
					x: -3,
					y: 9
				},
				frames: [0, 1],
				speed: 10
			},
			water_shallow: {
				layer: Constants.Layers.PLAYER_UNDER,
				offset: {
					x: -4,
					y: 10
				},
				frames: [2, 3],
				speed: 10
			}
		}

		this.layer = Constants.Layers.PLAYER_UNDER;
	}

	check(tile, moved) {
		// move to player position regardless of the visibility
		this.x = this.actor.x;
		this.y = this.actor.y;

		let type = tile.type;
		let anim = this.animations[tile.type];

		// check if we are on an animated tile
		if (anim) {
			// update the step count and advance the animation if the threshold is reached
			this.animations.stepcount += +moved;
			if (this.animations.stepcount >= anim.speed) {
				this.animations.stepcount = 0;
				this.animations.index++;
			}

			let _id;

			// 1. Set animation sprite
			// 2. change visibility based on the tile.type
			switch (type) {
				case Tileset.Types.GRASS:
				case Tileset.Types.WATER_SHALLOW:
					_id = anim.frames[this.animations.index % anim.frames.length];

					this.configSprite({
						sheet: "tileBasedEffects",
						id: _id,
						offset: anim.offset
					});

					this.layer = anim.layer;

					this.visible = true;
					break;
				default:
					// unknown type
					warn(`Unknown tile type ${type}. Tile: (${tile.x}/${tile.y})`, "TileBasedEffect");
					this.visible = false;
					break;
			}
		} else {
			// no effect found for the tile type
			this.visible = false;
		}
	}
}

export default TileBasedEffect;