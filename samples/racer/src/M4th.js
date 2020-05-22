import Helper from "../../../src/utils/Helper.js";

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

	fov(angle) {
		return 1/Math.tan(angle/2);
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

	interpolate(a,b,percent) {
		return a + (b-a)*percent;
	},

	limit: Helper.clamp,

	percentRemaining(n, total) {
		return (n%total)/total;
	},

	toInt(obj, def) {
		if (obj !== null) {
			var x = parseInt(obj, 10);
			if (!isNaN(x)) {
				return x;
			}
		}
		return M4th.toInt(def, 0);
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

	easeIn(a,b,percent) {
		return a + (b-a)*Math.pow(percent,2);
	},

	easeOut(a,b,percent) {
		return a + (b-a)*(1-Math.pow(1-percent,2));
	},

	easeInOut(a,b,percent) {
		return a + (b-a)*((-Math.cos(percent*Math.PI)/2) + 0.5);
	}
};

export default M4th;