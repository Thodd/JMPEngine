import Entity from "../../../../src/game/Entity.js";
import Constants from "../Constants.js";
import { error } from "../../../../src/utils/Log.js";
import AnimationPool from "../animations/AnimationPool.js";
import HurtAnimation from "../animations/HurtAnimation.js";
import DeathAnimation from "../animations/DeathAnimation.js";

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

		this.moveToTile(gameTile);

		this.updateVisualPosition();

		this._stats = {
			hp_max: 5,
			hp: 5,
			atk: 1,
			def: 1
		};

		// debugging for sprite positioning
		//this.RENDER_HITBOX = 0xFF0085;
		// this.updateHitbox({
		// 	x: 0, y:0, w:Constants.TILE_WIDTH, h:Constants.TILE_HEIGHT
		// });
	}

	toString() {
		return `BaseActor#${this._id}`;
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
	takeDamage(dmg) {
		let animations = [];

		if (dmg > 0) {
			let stats = this.getStats();
			stats.hp -= dmg;

			// I'm ded x_x
			if (stats.hp <= 0) {
				// TODO: Dying animation
				return this.die()
			} else {
				// TODO: Hurt animation
				return AnimationPool.get(HurtAnimation, this);
			}
		}

		return animations;
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
}

export default BaseActor;