// General
import Entity from "../../../../src/game/Entity.js";
import Helper from "../../../../src/utils/Helper.js";
import RNG from "../../../../src/utils/RNG.js";
import { error } from "../../../../src/utils/Log.js";
import Constants from "../Constants.js";

// UI
import UISystem from "../ui/UISystem.js";

// Stats
import Stats from "./Stats.js";

// Item Handling
import ItemTypes from "../items/ItemTypes.js";

// Battle
import BattleCalculator from "../combat/BattleCalculator.js";

// Animation System
import AnimationPool from "../animations/system/AnimationPool.js";
import AnimationSystem from "../animations/system/AnimationSystem.js";
import MovementAnimation from "../animations/MovementAnimation.js";
import HPUpdateAnimation from "../animations/HPUpdateAnimation.js";
import DeathAnimation from "../animations/DeathAnimation.js";
import BumpAnimation from "../animations/BumpAnimation.js";
import ChainAnimation from "../animations/ChainAnimation.js";
import ProjectileAnimation from "../animations/ProjectileAnimation.js";
import Backpack from "../items/Backpack.js";

let _ID = 0;

class BaseActor extends Entity {
	constructor({gameTile}) {
		super({});

		// default name is the class name
		this.name = `${this.constructor.name}#${this._ID}`;
		this.nameColor = "#fdf0d1";

		this.layer = Constants.Layers.NPC;

		// The actors don't need to do any game-logic updates on a frame basis.
		// Their AI will be triggered explicitly via the GameController --> see "takeTurn()".
		// Actors are Entitys only because we want to leverage the sprite rendering and frame-animation system.
		this.active = false;

		// global ID to distinguish default actors during debugging.
		this._id = _ID++;

		// place actor on start tile
		this.placeOnTile(gameTile);

		// trigger initial rendering
		this.updateVisualPosition();

		// default stats
		this._stats = new Stats();

		// inventory
		this._backpack = new Backpack();

		// holds information about things that happend since the last turn of this actor
		// can be used by other actors to store some information, which this AI might need
		this._sinceLastTurn = {};

		// debugging for sprite positioning
		//this.RENDER_HITBOX = 0xFF0085;
		// this.updateHitbox({
		// 	x: 0, y:0, w:Constants.TILE_WIDTH, h:Constants.TILE_HEIGHT
		// });
	}

	toString() {
		return `<span style="color: ${this.nameColor}">${this.name}</span>`;
	}

	/**
	 * Reset the information about the last turn.
	 */
	resetSinceLastTurnInfo() {
		this._sinceLastTurn = {};
	}

	/**
	 * Returns the Stats object of this actor.
	 * Contains HP etc.
	 */
	getStats() {
		return this._stats;
	}

	/**
	 * Returns the Backpack object of the actor.
	 * Contains Items, Equipment, etc.
	 */
	getBackpack() {
		return this._backpack;
	}

	/**
	 * Updates the visual position of the actor.
	 */
	updateVisualPosition() {
		this.x = this.gameTile.x * Constants.TILE_WIDTH;
		this.y = this.gameTile.y * Constants.TILE_HEIGHT;
	}

	/**
	 * Schedules the given animation.
	 * All scheduled animations will be played at the end of the turn.
	 */
	scheduleAnimation(anim, phaseName) {
		// Pass animations to the animation-system instance
		this.getGameController().getAnimationSystem().schedule(anim, phaseName);
	}

	takeTurn() {}

	/**
	 * Retrieves the Tile this Actor is on.
	 */
	getTile() {
		return this.gameTile;
	}

	/**
	 * Returns the player instance in the Screen this actor is added to.
	 */
	getPlayer() {
		return this.getScreen().getPlayer();
	}

	/**
	 * Convenience function to retrieve the currently active GameController instance.
	 * One per BaseMap.
	 */
	getGameController() {
		let screen = this.getScreen();
		if (screen) {
			return screen.getGameController();
		} else {
			error(`Cannot get GameController instance for actor ${this}. Actor is not added to a BaseMap instance yet.`, "BaseActor");
		}
	}

	/**
	 * Convenience function to return the Timeline to which this Actor is added.
	 */
	getTimeline() {
		return this.getGameController().getTimeline();
	}

	/**
	 * Convenience function to retrieve the currently active Tilemap instance.
	 * One per BaseMap.
	 */
	getTilemap() {
		let screen = this.getScreen();
		if (screen) {
			return screen.getTilemap();
		} else {
			error(`Cannot get Tilemap instance for Actor ${this}. Actor is not added to a BaseMap instance yet.`, "BaseActor");
		}
	}

	/**
	 * Convenience function to retrieve the currently used Cursor instance.
	 * One per BaseMap.
	 */
	getCursor() {
		let screen = this.getScreen();
		if (screen) {
			return screen.getCursor();
		} else {
			error(`Cannot get Cursor instance for Actor ${this}. Actor is not added to a BaseMap instance yet.`, "BaseActor");
		}
	}

	/**
	 * Places the actor on the given tile.
	 * NO animation is played.
	 *
	 * @param {GameTile} newTile the new tile for the actor
	 * @returns {boolean} whether the placement was successful (can be false if the tile is invalid, e.g. outside the map)
	 */
	placeOnTile(newTile) {
		if (newTile) {
			if (this.gameTile) {
				this.gameTile.removeActor(this);
			}
			newTile.addActor(this);
			this.gameTile = newTile;
		} else {
			error(`${this} cannot be moved to new Tile. Tile does not exist.`, "BaseActor");
		}
	}

	/**
	 * Moves the Actor to the given Tile.
	 * Schedules a movement animation.
	 *
	 * @param {GameTile} newTile the goal tile to move the actor to
	 */
	moveToTile(goalTile) {
		let startTile = this.gameTile;

		this.placeOnTile(goalTile);

		// start pixel-based MovementAnimation from one tile to another
		let moveAnim = AnimationPool.get(MovementAnimation, this);
		moveAnim.moveFromTo(startTile, goalTile);
		this.scheduleAnimation(moveAnim, AnimationSystem.Phases.GENERAL);
	}

	/**
	 * Tries to move the actor to the given GameTile but respecting collision.
	 * Returns wheter the move was made.
	 *
	 * @param {GameTile} goalTile the goal tile to move the actor to
	 * @returns whether the move could be made
	 */
	moveToTileWithCollision(goalTile) {
		if (goalTile && goalTile.isFree()) {
			this.moveToTile(goalTile);
			return true;
		}
		return false;
	}

	/**
	 * Very simple "step-towards" logic.
	 * Compares the coordinates and randomly picks a tile closer to the target actor.
	 * Obviously not as clever as using Dijkstra or A*, but good enough for a simple AI.
	 */
	moveTowardsActor(targetActor) {
		let dx = -1 * Math.sign(this.gameTile.x - targetActor.gameTile.x);
		let dy = -1 * Math.sign(this.gameTile.y - targetActor.gameTile.y);

		let possibleGoalTiles = [];

		if (dx != 0) {
			possibleGoalTiles.push(this.getTileRelative(dx, 0));
		}
		if (dy != 0) {
			possibleGoalTiles.push(this.getTileRelative(0, dy));
		}

		let r = RNG.random() > 0.5;
		let firstTile = r ? possibleGoalTiles[0] : possibleGoalTiles[1];
		let secondTile = !r ? possibleGoalTiles[0] : possibleGoalTiles[1];

		// try first movement possibility
		let moveMade = this.moveToTileWithCollision(firstTile);

		// try second possibility (if any)
		if (secondTile && !moveMade) {
			this.moveToTileWithCollision(secondTile);
		}
	}

	/**
	 * Makes a random move and schedules animations if needed.
	 *
	 * @param {BaseAnimation[]} anims a set of animations to which the random move should be added
	 */
	makeRandomMove() {
		let startTile = this.getTile();

		// pick random tile to move to
		let goalTile = Helper.choose(this.getAdjacentNeumannTiles().all);

		// only move if the start and goal tile are different
		// saves some Animation instances etc.
		if (goalTile && goalTile != startTile && goalTile.isFree()) {
			this.moveToTile(goalTile);
		}
	}

	/**
	 * Changes the Hitpoints of the actor.
	 * Can be positive (heal) or negative (damage).
	 * @param {int} delta the delta amount of health change
	 * @param {any} cause cause information for the health change
	 * @returns {HPUpdateAnimation|undefined} returns the HPUpdateAnimation if the HP actually changed, undefined otherwise
	 */
	updateHP(delta, cause) {
		// calculate actual delta (depends on max hp), might be 0 in the end
		let stats = this.getStats();
		if (stats.hp + delta > stats.hp_max) {
			delta = stats.hp_max - stats.hp;
		}

		stats.hp += delta;

		// hp is now below 0 --> die
		if (stats.hp <= 0) {
			return this.die()
		}

		if (delta > 0) {
			// track if this actor has healed somehow (e.g. potion, spell, ...)
			this._sinceLastTurn.hasHealed = cause || true;
			UISystem.log(`${this} gains ${delta} HP.`);
		} else if (delta < 0) {
			// track that this actor has taken damage by the given cause since its last turn (e.g. Player, Poison, Fire, ...)
			this._sinceLastTurn.hasTakenDamage = cause || true;
			UISystem.log(`${this} loses ${Math.abs(delta)} HP.`);
		}

		// create animation
		// set the hp delta number indicator & schedule the animation
		let hpUpdateAnim = AnimationPool.get(HPUpdateAnimation, this);
		hpUpdateAnim.setNumber(delta);
		return hpUpdateAnim;
	}

	/**
	 * Uses the given Item (if possible).
	 * @param {ItemType} item the item to be used
	 */
	useItem(item) {
		// consume an item
		if (item.hasCategory(ItemTypes.Categories.CONSUMABLE)) {
			UISystem.log(`${this} uses ${item.text.name}.`);

			let healthUpdateAnim = this.updateHP(item.values.restore, item.id);
			if (healthUpdateAnim) {
				this.scheduleAnimation(healthUpdateAnim, AnimationSystem.Phases.ITEM_USAGE);
			} else {
				UISystem.log(`Nothing happens.`);
			}
		}
	}

	/**
	 * Performs a melee attack against the given actor and schedules the necessary animations.
	 *
	 * @param {BaseActor} defender the defending actor
	 */
	meleeAttackActor(defender) {
		// Only attack living actors
		// it might happen that an actor dies on a turn before we had a chance to attack it
		if (!defender.isDead) {

			// determine animation phase
			let phase = this.isPlayer ? AnimationSystem.Phases.GENERAL : AnimationSystem.Phases.ENEMY_ATTACK;

			// bump animation
			// whether we hit or miss is irrelevant, we always perform the attack animation
			let bump = AnimationPool.get(BumpAnimation, this);
			bump.bumpTowards(defender.getTile());
			this.scheduleAnimation(bump, phase);

			// now do the actual battle
			let battleResult = BattleCalculator.battle(this, Constants.EquipmentSlots.MELEE);

			UISystem.log(`${this} attacks ${defender}.`);
			if (battleResult.damage == 0) {
				UISystem.log(`${this} misses!`);
			}

			// defender is hurt by this actor, schedule hurt animation
			// can also be "0! for a miss!
			let hurtAnim = defender.updateHP(-battleResult.damage, this);
			if (hurtAnim) {
				this.scheduleAnimation(hurtAnim, phase);
			}
		}
	}

	/**
	 * Shoots a projectile along the given line.
	 * @param {object} fireInfo contains the information needed to animate the shot
	 * @param {object} fireInfo.tilesPassed the line along which the projectile should fly
	 * @param {object} fireInfo.tileHit the final tile which is hit by the projectile
	 * @param {object} fireInfo actorHit the actor which is hit by the projectile
	 */
	fireShotAlongLine(fireInfo) {

		// determine animation phase
		let phase = this.isPlayer ? AnimationSystem.Phases.RANGED_ATTACKS_PLAYER : AnimationSystem.Phases.RANGED_ATTACKS_ENEMIES;

		// animation chain (projectile + optional hurt animation)
		let chainAnimation = AnimationPool.get(ChainAnimation, this);
		this.scheduleAnimation(chainAnimation, phase);

		// projectile animation
		let goalTile = fireInfo.tileHit;
		let projAnim = AnimationPool.get(ProjectileAnimation, this);
		projAnim.moveFromTo(this.gameTile, goalTile);
		chainAnimation.add(projAnim);

		if (fireInfo.actorHit) {
			UISystem.log(`${this} fires a shot at ${fireInfo.actorHit}.`);
			let hurtAnim = this.rangeAttackActor(fireInfo.actorHit);
			if (hurtAnim) {
				chainAnimation.add(hurtAnim);
			}
		} else {
			UISystem.log(`${this} hits ${fireInfo.tileHit.type.text ? fireInfo.tileHit.type.text.innerName : 'nothing'}.`);
		}
	}

	/**
	 * Performs a ranged attack against a given BaseActor.
	 * @param {BaseActor} defender the actor that is shot
	 */
	rangeAttackActor(defender) {
		// dead actors can't be damaged anymore...
		if (!defender.isDead) {
			let battleResult = BattleCalculator.battle(this, Constants.EquipmentSlots.RANGED);
			if (battleResult.damage == 0) {
				UISystem.log(`${this} misses!`);
			}

			// defender is hurt by this actor, return a HurtAnimation instance
			// can also be "0! for a miss!
			return defender.updateHP(-battleResult.damage, this);
		}
	}

	/**
	 * Kills the actor.
	 * Returns its dying animation.
	 */
	die() {
		if (!this.isDead) {
			UISystem.log(`${this} dies!`);

			// we need to create the animation before destroying the Entity --> otherwise the Animation cannot get the Screen instance anymore!
			let deathAnim = AnimationPool.get(DeathAnimation, this);

			this.isDead = true;

			// call afterDeath Hook (actor is still on the tile and entity is not yet destroyed!)
			this.afterDeath();

			// remove actor from game logic
			this.getTimeline().removeActor(this);

			// remove actor from its tile
			this.gameTile.removeActor(this);

			// remove actor from screen/engine
			this.destroy();

			// the death animation is just for show
			return deathAnim;
		}
	}

	/**
	 * afterDeath Hook.
	 * The actor is still on the tile and entity is not yet destroyed.
	 */
	afterDeath() {}

	/**
	 * Returns a random adjacent tile.
	 * Moore-Neighborhood.
	 */
	getAdjacentMooreTiles() {
		let tiles = this.getAdjacentNeumannTiles();

		let tilemap = this.getTilemap();
		let NE = tilemap.get(this.gameTile.x + 1, this.gameTile.y - 1);
		let SE = tilemap.get(this.gameTile.x + 1, this.gameTile.y + 1);
		let SW = tilemap.get(this.gameTile.x - 1, this.gameTile.y + 1);
		let NW = tilemap.get(this.gameTile.x - 1, this.gameTile.y - 1);

		// make sure we don't have undefined in our map/all-array
		if (NE) {
			tiles.NE = NE;
			tiles.all.push(NE);
		}
		if (SE) {
			tiles.SE = SE;
			tiles.all.push(SE);
		}
		if (SW) {
			tiles.SW = SW;
			tiles.all.push(SW);
		}
		if (NW) {
			tiles.NW = NW;
			tiles.all.push(NW);
		}

		return tiles;
	}

	getAdjacentNeumannTiles() {
		let tilemap = this.getTilemap();
		let N = tilemap.get(this.gameTile.x + 0, this.gameTile.y - 1);
		let E = tilemap.get(this.gameTile.x + 1, this.gameTile.y + 0);
		let S = tilemap.get(this.gameTile.x + 0, this.gameTile.y + 1);
		let W = tilemap.get(this.gameTile.x - 1, this.gameTile.y + 0);

		let tiles = {
			all: []
		};

		// make sure we don't have undefined in our map/all-array
		// makes stuff easier for callers
		if (N) {
			tiles.N = N;
			tiles.all.push(N);
		}
		if (E) {
			tiles.E = E;
			tiles.all.push(E);
		}
		if (S) {
			tiles.S = S;
			tiles.all.push(S);
		}
		if (W) {
			tiles.W = W;
			tiles.all.push(W);
		}

		return tiles;
	}

	/**
	 * Retrieves a Tile relative to the actors current tile.
	 * @param {int} dx x delta
	 * @param {int} dy y delta
	 */
	getTileRelative(dx, dy) {
		return this.gameTile.getRelative(dx, dy);
	}

	/**
	 * Calculates the manhattan distance to the given BaseActor instance.
	 * Typically used by Enemies to check if the player is near.
	 *
	 * @param {BaseActor} actor the actor to which we want to calculate the distance
	 */
	manhattanDistanceTo(actor) {
		let a = this.gameTile;
		let b = actor.gameTile;
		return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
	}

	/**
	 * Calculates the euclidian distance to the given BaseActor instance.
	 *
	 * @param {BaseActor} actor the actor to which we want to calculate the distance
	 */
	euclidianDistanceTo(actor) {
		let a = this.gameTile;
		let b = actor.gameTile;
		return Math.sqrt(Math.pow(a.x-b.x, 2) + Math.pow(a.y-b.y, 2));
	}

	/**
	 * Checks if this BaseActor is standing one tile away from the given actor.
	 *
	 * @param {BaseActor} actor the actor to check
	 * @param {boolean} diagonal whether diagonal tiles should be checked
	 */
	isStandingAdjacent(actor, diagonal = false) {
		let t1 = this.gameTile;
		let t2 = actor.gameTile;
		let xDif = Math.abs(t1.x - t2.x);
		let yDif = Math.abs(t1.y - t2.y);

		// anything farther than 1 is not considered "adjacent"
		if (xDif > 1 || yDif > 1) {
			return false;
		}

		if (diagonal) {
			if (xDif === 1 || yDif === 1) {
				return true;
			}
		} else {
			return (xDif === 1 && yDif === 0) || (xDif === 0 && yDif === 1);
		}
	}
}

export default BaseActor;