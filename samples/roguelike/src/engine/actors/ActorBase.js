// JMP imports
import Helper from "../../../../../src/utils/Helper.js"
import { log } from "../../../../../src/utils/Log.js";

// core imports
import AnimationPool from "../../core/animations/AnimationPool.js";
import RLActor from "../../core/RLActor.js";

// engine imports
import ItemBase from "./ItemBase.js";
import Stats from "../combat/Stats.js";
import Backpack from "../inventory/Backpack.js";
import EquipmentSlots from "../inventory/EquipmentSlots.js";
import BattleCalculator from "../combat/BattleCalculator.js";

// gamecontent imports
import HPUpdate from "../../gamecontent/animations/HPUpdate.js";
import ScreenShake from "../../gamecontent/animations/ScreenShake.js";

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
		super(spec);

		// by default an Actor cannot be passed over by another actor
		this.walkable = false;

		// by default we take the class as a name
		this.name = this.constructor.name;

		// each actor has a backpack for weapons and loot
		this._backpack = new Backpack();

		// Stats object
		this._stats = new Stats();

		// call definition hooks to setup the actor
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
	equipInitialWeapon(w) {
		if (w) {
			this.getBackpack().addItem(w);
			this.getBackpack().equipItem(w, EquipmentSlots.MELEE);
		}
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
		if (!defender.dead) {
			// now do the actual battle
			let battleResult = BattleCalculator.battle(this, defender, EquipmentSlots.MELEE);

			let battleMessage = `${this} attacks ${defender} `;
			if (battleResult.damage == 0) {
				battleMessage += `and misses!`;
			} else {
				battleMessage += `for ${battleResult.damage} dmg.`;
				defender.updateHP(-battleResult.damage, this);
			}
			log(battleMessage);
		}
	}

	/**
	 * Changes the HP of the Actor by the given amount.
	 * @param {number} hpDelta the HP delta
	 * @param {ActorBase} source the source actor responsible for the HP update of this actor
	 */
	updateHP(hpDelta, source=this) {
		let stats = this.getStats();
		stats.hp += hpDelta;

		// determine animation phase
		let phase = source.isPlayer ? "PLAYER_ATTACKS" : "ENEMY_ATTACKS";

		let hpUpdateAnim = AnimationPool.get(HPUpdate, {
			actor: this,
			hpDelta: hpDelta
		});
		this.getAnimationSystem().schedule(phase, hpUpdateAnim);

		// shake screen if the player is hurt
		if (this.isPlayer && hpDelta < 0) {
			let shakeAnim = AnimationPool.get(ScreenShake, { map: this.getMap() });
			this.getAnimationSystem().schedule(phase, shakeAnim);
		}

		if (stats.hp <= 0) {
			this.die();
		}
	}

	/**
	 * Let's the actor pickup an item from the floor.
	 * Item is placed in the Backpack.
	 */
	pickupItemFromFloor() {
		let cell = this.getCell();
		let possibleItems = cell.getActors();

		let bp = this.getBackpack();
		for (let item of possibleItems) {
			if (item instanceof ItemBase) {
				bp.addItem(item.getType());
				item.removeFromCell();

				log(`Picked up: '${item.getType().text.name}'`, "Player");
			}
		}
	}

	die() {
		this.dead = true;
	}
}

export default ActorBase;