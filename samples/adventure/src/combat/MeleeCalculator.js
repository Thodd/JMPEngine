import RNG from "../../../../src/utils/RNG.js";

const MeleeCalculator = {
	battle(attacker, defender) {
		let dmg = 0;
		let hit = false;

		// every attack has at least 10% hit chance
		let baseProbability = 0.1;

		let attackerStats = attacker.getStats();
		let defenderStats = defender.getStats();

		// at least 10% hit chance, maximum 98% (so even the best attacker might miss sometimes)
		let hitProbability = Math.min(Math.min(baseProbability + (attackerStats.atk / defenderStats.def), 1), 0.98);

		// if the attacker hits, at least 1 dmg is dealt to the defender
		if (RNG.random() < hitProbability) {
			hit = true;
			dmg = Math.min(1, Math.max(0, attackerStats.atk - defenderStats.def));
		}

		return {
			defenderWasHit: hit,
			damage: dmg,
			defenderDies: defenderStats.hp - dmg <= 0 // defender dies when the dmg would reduce its HP to 0 or lower
		}
	}
};

export default MeleeCalculator;