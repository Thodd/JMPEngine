import Helper from "../../../src/utils/Helper.js";
import { interpolate, easeIn, easeOut, easeInOut } from "../../../src/utils/M4th.js";

/**
 * Functions are either part;
 *  - from the built-in JMP M4th lib, e.g. Easing
 *  - taken from https://github.com/jakesgordon/javascript-racer/, MIT License
 */
const M4th = {

	project(p, cameraX, cameraY, cameraZ, cameraDepth, width, height, roadWidth) {
		p.camera.x     = (p.world.x || 0) - cameraX;
		p.camera.y     = (p.world.y || 0) - cameraY;
		p.camera.z     = (p.world.z || 0) - cameraZ;
		p.screen.scale = cameraDepth/p.camera.z;
		p.screen.x     = Math.round((width/2)  + (p.screen.scale * p.camera.x  * width/2));
		p.screen.y     = Math.round((height/2) - (p.screen.scale * p.camera.y  * height/2));
		p.screen.w     = Math.round(             (p.screen.scale * roadWidth   * width/2));
	},

	exponentialFog(distance, density) {
		return 1 / (Math.pow(Math.E, (distance * distance * density)));
	},

	accelerate(v, acc, dt) {
		return v + (acc * dt);
	},

	increase(start, inc, max) {
		let result = start + inc;
		while (result >= max) {
			result -= max;
		}
		while (result < 0) {
			result += max;
		}
		return result;
	},

	interpolate: interpolate,

	limit: Helper.clamp,

	percentRemaining(n, total) {
		return (n%total)/total;
	},

	collides(x1, w1, x2, w2) {
		let w1_half = w1/2;
		let w2_half = w2/2;
		let min1 = x1 - w1_half;
		let max1 = x1 + w1_half;
		let min2 = x2 - w2_half;
		let max2 = x2 + w2_half;
		return !((max1 < min2) || (min1 > max2));
	},

	easeIn: easeIn,

	easeOut: easeOut,

	easeInOut: easeInOut
};

export default M4th;