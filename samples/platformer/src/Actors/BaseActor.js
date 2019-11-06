import Entity from "../../../../src/game/Entity";

class BaseActor extends Entity {
	constructor(x, y) {
		super();
		this.x = x;
		this.y = y;
	}
}

export default BaseActor;