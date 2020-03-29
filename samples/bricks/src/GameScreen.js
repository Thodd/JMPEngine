import Screen from "../../../src/game/Screen.js";
import Spritesheets from "../../../src/gfx/Spritesheets.js";
import Piece from "./Piece.js";
import Entity from "../../../src/game/Entity.js";
import Well from "./Well.js";
import RNG from "../../../src/utils/RNG.js";
import GFX from "../../../src/gfx/GFX.js";

/**
 * w: 10
 * h: 20
 */

class GameScreen extends Screen {
	constructor() {
		super();

		RNG.seed(-9811, true);

		let bg = new Entity(0, 0);
		bg.layer = 0;
		bg.setSprite({
			sheet: "UI"
		});
		this.add(bg);

		Well.init(this);

		// create a new piece and implicitly add it as the "currentPiece" to the Well
		let p = new Piece(Piece.getRandomPieceType());
		Well.addPiece(p);
		Well.movePiece(p, 0, 10);

		p = new Piece(Piece.getRandomPieceType());
		Well.addPiece(p);
		Well.movePiece(p, 3, 10);

		p = new Piece(Piece.getRandomPieceType());
		Well.addPiece(p);

		// setInterval(() => {
		// 	let p = Well.getCurrentPiece();
		// 	Well.movePiece(p, 0, 1);
		// }, 500)
	}

	render() {
		super.render();

		// debug rendering of current piece origin
		let sheet = Spritesheets.getSheet("bricks");
		let p = Well.getCurrentPiece();
		let originX = sheet.w * (Well.ORIGIN_X + p.well_x);
		let originY = sheet.h * (Well.ORIGIN_Y + p.well_y);
		GFX.px(originX,     originY,     "#ffffff", 2);
		GFX.px(originX + 1, originY,     "#ffffff", 2);
		GFX.px(originX    , originY + 1, "#ffffff", 2);
		GFX.px(originX + 1, originY + 1, "#ffffff", 2);
	}
}

export default GameScreen;