import Helper from "../../../../../src/utils/Helper.js"
import { log } from "../../../../../src/utils/Log.js";
import AnimationPool from "../../core/animations/AnimationPool.js";

import RLActor from "../../core/RLActor.js";
import Hurt from "../../gamecontent/animations/Hurt.js";
import ScreenShake from "../../gamecontent/animations/ScreenShake.js";

import BattleCalculator from "../combat/BattleCalculator.js";
import Stats from "../combat/Stats.js";
import Backpack from "../inventory/Backpack.js";
import EquipmentSlots from "../inventory/EquipmentSlots.js";

/**
 * Base class for all game Actors.
 * Enhances the RLActor class with additional things like Rooms, ...
 * @param {object} [spec] the specification of the actor
 * @param {object} [spec.visuals] the visual definition (if any)
 * @param {object} [spec.stats] the stats definition (if any)
 * @param {object} [spec.weapon] the weapon definition (if any)
 */
class ActorBase extends RLActor {
	constructor(spec) {
		super();

		// by default an Actor cannot be passed over by another actor
		this.isWalkable = false;

		// by default we take the class as a name
		this.name = this.constructor.name;

		// each actor has a backpack for weapons and loot
		this._backpack = new Backpack();

		// Stats object
		this._stats = new Stats();

		// call definition hooks to setup the actor
		this.defineVisuals(spec?.visuals);
		this.defineStats(spec?.stats);
		this.equipInitialWeapon(spec?.weapon);
	}

	/**
	 * Returns the name of the Actor. Defaults to the class name.
	 * @returns {string} the name of the actor
	 */
	toString() {
		return this.name;
	}

	/**
	 * @override
	 */
	getTimelineInfo() {
		// timeline info is contained in the Stats object
		return this._stats._timelineInfo;
	}

	/**
	 * Returns the backpack of the actor.
	 * @returns {Backpack} the backpack of the actor
	 * @public
	 */
	getBackpack() {
		return this._backpack;
	}

	/**
	 * Returns the stats value object for the actor.
	 * @returns {Stats} the stats value object of the actor
	 * @public
	 */
	getStats() {
		return this._stats;
	}

	/**
	 * Hook to set the visuals of the Actor.
	 * Can be overriden in subclasses for special handling.
	 *
	 * By default an object with id, color and background is used.
	 * e.g.
	 * {
	 *    id: char2id("/"),
	 *    color: 0xFF0085
	 *    background: undefined // can be optional
	 * }
	 * @protected
	 */
	defineVisuals(v) {
		this.id = v.id
		this.color = v.color;
		this.background = v.background;
	}

	/**
	 * Hook to set the stat value of the Actor.
	 * Can be overriden in subclasses for special handling.
	 * @protected
	 */
	defineStats() {}

	/**
	 * Hook to equip the initial weapon of the Actor.
	 * Can be overriden in subclasses for special handling.
	 * @protected
	 */
	equipInitialWeapon() {}

	/**
	 * Sets the Room for this Actor.
	 * @param {Room} r the room this actor belongs to
	 */
	setRoom(r) {
		this.room = r;
	}

	/**
	 * Returns the Room in which this actor is placed.
	 * @returns {Room} the Room of this actor
	 * @public
	 */
	getRoom() {
		return this.room;
	}

	/**
	 * Makes a random move to a free adjacent cell.
	 */
	makeRandomMove() {
		let c = this.getCell();
		let adjacentCells = c.getNeumannNeighborCells();
		let randomDir = Helper.choose(Object.keys(adjacentCells));
		let targetCell = adjacentCells[randomDir];
		if (targetCell.isFree()) {
			this.moveToCell(targetCell);
		}
	}

	/**
	 * Performs a melee attack against another actor.
	 *
	 * @param {ActorBase} defender the defending actor
	 */
	meleeAttackActor(defender) {
		// Only attack living actors
		// it might happen that an actor dies on a turn before we had a chance to attack it
		if (!defender.isDead) {
			// now do the actual battle
			let battleResult = BattleCalculator.battle(this, defender, EquipmentSlots.MELEE);

			let battleMessage = `${this} attacks ${defender} `;
			if (battleResult.damage == 0) {
				battleMessage += `and misses!`;
			} else {
				battleMessage += `for ${battleResult.damage} dmg.`;
				defender.takeDamage(battleResult.damage);
			}
			log(battleMessage);
		}
	}

	takeDamage(dmg) {
		if (dmg > 0) {
			let stats = this.getStats();
			stats.hp -= dmg;

			// determine animation phase
			let phase = this.isPlayer ? "PLAYER_ATTACKS" : "ENEMY_ATTACKS";

			// hurt
			let hurtAnim = AnimationPool.get(Hurt, { actor: this });
			this.getAnimationSystem().schedule(phase, hurtAnim);

			// screen shake if the player is hit
			if (this.isPlayer) {
				let shakeAnim = AnimationPool.get(ScreenShake, { map: this.getMap() });
				this.getAnimationSystem().schedule(phase, shakeAnim);
			}

			if (stats.hp <= 0) {
				this.die();
			}
		}
	}

	die() {
		this.isDead = true;
	}
}

export default ActorBase;