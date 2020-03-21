import Screen from "../../../src/game/Screen.js";
import Piece from "./Piece.js";
import Entity from "../../../src/game/Entity.js";
import Well from "./Well.js";
import RNG from "../../../src/utils/RNG.js";

/**
 * w: 10
 * h: 20
 */

class GameScreen extends Screen {
	constructor() {
		super();

		RNG.seed(Date.now(), true);

		let clear = this.getLayers(0);
		clear.clearColor = "#1b2632";

		let bg = new Entity(0, 0);
		bg.setSprite({
			sheet: "UI"
		});
		this.add(bg);

		Well.init(this);

		let p = new Piece(0, 0, Piece.getRandomPieceType());

		Well.addPiece(p);
	}
}

export default GameScreen;