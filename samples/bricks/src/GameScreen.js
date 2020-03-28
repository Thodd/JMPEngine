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

		// create a new piece and implicitly add it as the "currentPiece" to the Well
		let p = new Piece(Piece.getRandomPieceType());
		Well.addPiece(p);

		// setInterval(() => {
		// 	let p = Well.getCurrentPiece();
		// 	Well.movePiece(p, 0, 1);
		// }, 500)
	}
}

export default GameScreen;