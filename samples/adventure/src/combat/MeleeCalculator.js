import RNG from "../../../../src/utils/RNG.js";

const MeleeCalculator = {
	battle(attacker, defender) {
		let result = {
			defenderWasHit: false,
			damage: 0,
			defenderDies: false
		};

		let attackWeapon = attacker.getBackpack().getItemFromSlot("melee");

		if (attackWeapon) {
			let battleValues = attackWeapon.values;

			// if the attacker hits, at least 1 dmg is dealt to the defender
			if (RNG.random() < battleValues.acc) {
				result.defenderWasHit = true;
				result.damage = battleValues.dmg;
			}
		}

		return result;
	}
};

export default MeleeCalculator;