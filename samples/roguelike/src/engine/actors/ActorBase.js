import Helper from "../../../../../src/utils/Helper.js"
import { warn, log } from "../../../../../src/utils/Log.js";

import RLActor from "../../core/RLActor.js";

import BattleCalculator from "../combat/BattleCalculator.js";
import Stats from "../combat/Stats.js";
import Backpack from "../inventory/Backpack.js";
import EquipmentSlots from "../inventory/EquipmentSlots.js";

/**
 * Base class for all game Actors.
 * Enhances the RLActor class with additional things like Rooms, ...
 */
class ActorBase extends RLActor {
	constructor() {
		super();

		// by default an Actor cannot be passed over by another actor
		// this might be changed for Items, loot-drops etc.
		this.isWalkable = false;

		this._isDead = false;

		// by default we take the class as a name
		this.name = this.constructor.name;

		// each actor has a backpack for weapons and loot
		this._backpack = new Backpack();

		// Stats object
		this._stats = new Stats();
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
	 * Marks an actor as dead.
	 * Dead actors are removed from the game entirely, including the Timeline.
	 */
	set isDead(v) {
		if (v != true) {
			warn("An Actor cannot be set to 'undead'. Something went wrong :D", "ActorBase");
		}
		this._isDead = true;
		// TODO: remove from timeline
	}

	/**
	 * Returns whether the actor is dead.
	 */
	get isDead() {
		return this._isDead;
	}

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

			// determine animation phase
			//let phase = this.isPlayer ? "PLAYER_ATTACKS" : "ENEMY_ATTACKS";

			// now do the actual battle
			let battleResult = BattleCalculator.battle(this, defender, EquipmentSlots.MELEE);

			let battleMessage = `${this} attacks ${defender} `;
			if (battleResult.damage == 0) {
				battleMessage += `and misses!`;
			} else {
				battleMessage += `for ${battleResult.damage} dmg.`;
			}
			log(battleMessage);

			// defender is hurt by this actor, schedule hurt animation
			// can also be "0! for a miss!
			// let hurtAnim = defender.updateHP(-battleResult.damage, this);
			// if (hurtAnim) {
			// 	this.scheduleAnimation(hurtAnim, phase);
			// }
		}
	}
}

export default ActorBase;