import { log } from "../../../../../src/utils/Log.js";

const effectEntities = {};

/**
 * Allows to retreive an
 */
const EffectPool = {
	get(EffectClass, tile) {
		// we store the effects by their class name
		if (!effectEntities[EffectClass.name]) {
			effectEntities[EffectClass.name] = [];
		}

		let effect = effectEntities[EffectClass.name].pop();

		if (!effect) {
			log(`new Effect instance created from class '${EffectClass.name}.`, "EffectPool");
			effect = new EffectClass();
		}

		// set the gamet-tile for the effect: reset() might depend on the tile location, e.g. blood splatter, butterflies :3
		effect.setTile(tile);
		effect.reset();

		return effect;
	},

	_pool() {
		return effectEntities;
	},

	release(effect) {
		effectEntities[effect.constructor.name].push(effect);
	}
};

export default EffectPool;