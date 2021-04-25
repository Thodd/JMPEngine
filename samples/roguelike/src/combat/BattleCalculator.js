import RNG from "../../../../src/utils/RNG.js";

const BattleCalculator = {
	battle(attacker, weaponSlot) {
		let result = {
			defenderWasHit: false,
			damage: 0
		};

		let attackWeapon = attacker.getBackpack().getItemFromSlot(weaponSlot);

		if (attackWeapon) {
			let battleValues = attackWeapon.values;

			// simple accuracy check :)
			if (RNG.random() < battleValues.acc) {
				result.defenderWasHit = true;
				result.damage = battleValues.dmg;
			}
		}

		return result;
	}
};

export default BattleCalculator;