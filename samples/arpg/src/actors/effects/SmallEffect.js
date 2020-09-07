import Entity from "../../../../../src/game/Entity.js";
import Constants from "../../Constants.js";

const _pool = [];

class SmallEffect extends Entity {
	constructor() {
		super(0, 0);

		this.configSprite({
			sheet: "smallEffects",
			animations: {
				"invisible": {
					frames: [0]
				},
				"leafs": {
					frames: [1, 2, 3, 4, 5, 4, 5],
					dt: 4
				},
				// TODO: add more small effects here, e.g. explosions
				default: "invisible"
			}
		});

		this.layer = Constants.Layers.PLAYER_UNDER;
	}

	/**
	 * Shows the small effect. Once its animation ended, the effect is removed from the Screen and returned to the pool.
	 * @param {function} doneCallback called once the small effect is finished playing it's animation
	 */
	show(doneCallback) {
		this.playAnimation({name:"leafs", done: () => {
			// make invisible
			this.playAnimation({name: "invisible"});

			// remove from the screen once finished
			this.getScreen().remove(this);

			// return to pool
			_pool.push(this);

			// inform caller about animation end
			if (doneCallback) {
				doneCallback();
			}
		}});
	}
}

/**
 * Factory for accessing the SmallEffects pool.
 */
SmallEffect.get = function () {
	let effect = _pool.pop();
	if (!effect) {
		// create a new instance if the pool is empty
		// otherwise we recycle the small effects entities
		effect = new SmallEffect();
	}
	return effect;
}

export default SmallEffect;