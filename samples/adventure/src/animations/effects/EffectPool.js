import { log } from "../../../../../src/utils/Log.js";
import { exposeOnWindow } from "../../../../../src/utils/Helper.js";


const effectEntities = {};

/**
 * Allows to retreive an Effect instance.
 * Effects are purely visual entities for rendering things like destroy-animations, blood, etc.
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

		// set the game-tile for the effect: reset() might depend on the tile location, e.g. blood splatter, butterflies :3
		effect.setTile(tile);
		effect.reset();

		return effect;
	},

	_pool() {
		return effectEntities;
	},

	release(effect) {
		// remove effect from the screen (if added)
		let scr = effect.getScreen();
		if (scr) {
			scr.remove(effect);
		}
		// put it back into the pool
		effectEntities[effect.constructor.name].push(effect);
	}
};

exposeOnWindow("EffectPool", EffectPool);

export default EffectPool;