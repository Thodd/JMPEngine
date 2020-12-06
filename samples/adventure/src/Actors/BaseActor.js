import Entity from "../../../../src/game/Entity.js";
import Constants from "../Constants.js";
import { log, error } from "../../../../src/utils/Log.js";

import MeleeCalculator from "../combat/MeleeCalculator.js";
import AnimationPool from "../animations/AnimationPool.js";
import HurtAnimation from "../animations/HurtAnimation.js";
import DeathAnimation from "../animations/DeathAnimation.js";
import BumpAnimation from "../animations/BumpAnimation.js";

let _ID = 0;

class BaseActor extends Entity {
	constructor({gameTile}) {
		super({});

		this.layer = Constants.Layers.NPC;

		// The actors don't need to do any game-logic updates on a frame basis.
		// Their AI will be triggered explicitly via the GameController --> see "takeTurn()".
		// Actors are Entitys only because we want to leverage the sprite rendering and frame-animation system.
		this.active = false;

		// global ID to distinguish default actors during debugging.
		this._id = _ID++;

		// a list of all animations which will be played after the actors turn
		this._scheduledAnimations = [];

		// place actor on start tile
		this.moveToTile(gameTile);

		// trigger initial rendering
		this.updateVisualPosition();

		// default stats, overwritten in subclasses
		this._stats = {
			hp_max: 5,
			hp: 5,
			atk: 1,
			def: 1
		};

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
		return `BaseActor#${this._id}`;
	}

	resetSinceLastTurnInfo() {
		this._sinceLastTurn = {};
	}

	/**
	 * Returns the current stat object of this actor.
	 * Contains HP etc.
	 */
	getStats() {
		return this._stats;
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
	scheduleAnimation(anim) {
		if (Array.isArray(anim) && anim.length > 0) {
			// multiple animations (but no empty arrays)
			this._scheduledAnimations.push([...anim]);
		} else {
			// only one animation
			this._scheduledAnimations.push(anim);
		}
	}

	takeTurn() {
		// no animations
		return [];
	}

	endTurn() {

	}

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
	 */
	getGameController() {
		let screen = this.getScreen();
		if (screen) {
			return screen.getGameController();
		} else {
			error(`Cannot get GameController instance for actor ${this}. Actor is not added to a screen yet.`, "BaseActor");
		}
	}

	/**
	 * Convenience function to retrieve the currently active Tilemap instance.
	 */
	getTilemap() {
		let screen = this.getScreen();
		if (screen) {
			return screen.getTilemap();
		} else {
			error(`Cannot get Tilemap instance for Actor ${this}. Actor is not added to a screen yet.`, "BaseActor");
		}
	}

	/**
	 * Moves the Actor to the GameTile at the given coordinates in the Tilemap.
	 * @param {int} x
	 * @param {int} y
	 */
	moveTo(x, y) {
		let tilemap = this.getTilemap();

		if (tilemap) {
			let newTile = tilemap.get(x, y);

			if (newTile) {
				// first remove from old tile
				this.gameTile.removeActor(this);

				// then add to new tile
				newTile.addActor(this);
				this.gameTile = newTile;
			} else {
				error(`${this} cannot be moved to tile: (${x}, ${y}). Tile does not exist.`, "BaseActor");
			}
		} else {
			error(`${this} cannot be moved to tile: (${x}, ${y}). Actor is not added to a Screen with a Tilemap.`, "BaseActor");
		}
	}

	/**
	 * Moves the Actor to the given Tile.
	 * @param {*} newTile
	 */
	moveToTile(newTile) {
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
	 * Let's the actor take damage.
	 * Returns the animations which might be played because of the taken damage.
	 *
	 * @param {int} dmg the damage taken by the actor
	 */
	takeDamage(dmg, cause) {
		let animations = [];

		if (dmg > 0) {
			let stats = this.getStats();
			stats.hp -= dmg;

			// I'm ded x_x
			if (stats.hp <= 0) {
				return this.die()
			} else {
				// track that this actor has taken damage by the given cause since its last turn (e.g. Player, Poison, Fire, ...)
				this._sinceLastTurn.hasTakenDamage = cause || true;

				// set the damage number indicator & schedule the hurt animation
				let hurtAnim = AnimationPool.get(HurtAnimation, this);
				hurtAnim.setDamageNumber(dmg);
				return hurtAnim;
			}
		}

		return animations;
	}

	/**
	 * Performs a melee attack against the given actor and schedules the necessary animations.
	 *
	 * @param {BaseActor} defender the defending actor
	 */
	meleeAttackActor(defender) {
		// bump animation
		// whether we hit or miss is irrelevant, we always perform the attack animation
		let bump = AnimationPool.get(BumpAnimation, this);
		bump.bumpTowards(defender.getTile());
		this.scheduleAnimation(bump);

		// now do the actual battle
		let battleResult = MeleeCalculator.battle(this, defender);

		if (battleResult.defenderWasHit) {
			log(`attacks ${defender} at (${defender.gameTile.x},${defender.gameTile.y}) for ${battleResult.damage}dmg.`, this);
			// defender is hurt by this actor, schedule hurt animation
			let hurt = defender.takeDamage(battleResult.damage, this);
			this.scheduleAnimation(hurt);
		} else {
			log(`misses ${defender}.`, this);
		}
	}

	/**
	 * Kills the actor.
	 * Returns its dying animation.
	 */
	die() {
		this.isDead = true;

		// remove actor from game logic
		this.getGameController().removeActor(this);

		// remove actor from its tile
		this.gameTile.removeActor(this);

		// remove actor from screen/engine
		this.destroy();

		// the death animation is just for show
		return AnimationPool.get(DeathAnimation, this);
	}

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