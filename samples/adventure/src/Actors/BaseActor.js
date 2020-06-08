import Entity from "../../../../src/game/Entity.js";
import Constants from "../Constants.js";

class BaseActor extends Entity {
	constructor({gc, map_x=0, map_y=0}) {
		super({});

		this.gameController = gc;
		this.map_x = map_x;
		this.map_y = map_y;

		this.updatePosition();
	}

	updatePosition() {
		this.x = this.map_x * Constants.TILE_WIDTH;
		this.y = this.map_y * Constants.TILE_HEIGHT;
	}

	takeTurn() {
		// no animations
		return [];
	}

	endTurn() {

	}
}

export default BaseActor;