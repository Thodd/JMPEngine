import Spritesheets from "../../../../src/assets/Spritesheets.js";
import PixelBuffer from "../../../../src/game/PixelBuffer.js";
import DemoScreen from "../DemoScreen.js";

const WIDTH = 240;
const WIDTH_HALF = WIDTH / 2;
const HEIGHT = 144;
const HEIGHT_HALF = HEIGHT / 2;

class Mode7 extends DemoScreen {
	constructor() {
		super();

		// we create a pixel buffer from a source texture to access single pixels
		const sourceBuffer = PixelBuffer.fromSpritesheet("track");
		this.source = {
			buffer: sourceBuffer,
			w: sourceBuffer.width,
			h: sourceBuffer.height
		};

		this.px = new PixelBuffer({width: 240, height: 144});
		this.add(this.px);

		this.frameCount = 0;
	}

	update() {
		this.frameCount++;

		//The new coords that will be used to get the pixel on the texture
		let dx, dy;

		//z - the incrementable variable that beggins at -300 and go to 300, because
		//the depth will be in the center of the HEIGHT
		let z = 0;

		//Scales just to control de scale of the printed pixel. It is not necessary
		let scaleX = 16;
		let scaleY = 16;

		//Mode 7 - loop (Left Top to Down)
		for(let y = 40; y < HEIGHT; y++){

			if (z > 0) {
				dy = y / z; //The new dy coord generated
				if (dy < 0) {
					dy *= -1; //Control the dy because the z starting with a negative number
				}
				dy += this.frameCount/50;
				dy *= scaleY; //Increase the size using scale
				dy %= this.source.h; //Repeat the pixel avoiding get texture out of bounds

				for(let x = 0; x < WIDTH; x++){

					dx = (WIDTH_HALF - x) / z; //The new dx coord generated
					if(dx < 0) {
						dx *= -1; //Control the dx to dont be negative
					}
					dx *= scaleX; //Increase the size using scale
					dx += this.frameCount/50;
					dx %= this.source.w; //Repeat the pixel avoiding get texture out of bounds

					//Set x,y of the view image with the dx,dy pixel in the texture
					this.px.set(x, y, this.source.buffer.get(dx | 0, dy | 0));
				}
			}
			//Increment depth
			z++;
		}
	}
}

export default Mode7;