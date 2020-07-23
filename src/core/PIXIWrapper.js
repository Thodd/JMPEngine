import { error } from "../utils/Log.js";

// global pixi namespace
const PIXI = window.PIXI;

// the main PIXI.Application instance
let pixiApp;

const detectPIXI = function() {
	if (!PIXI) {
		error("PIXI.js rendering library is not available.\nPlease include a version PIXI.js (5.3.0+) globally before bootstrapping the JMP Engine.", "Engine");
		return false;
	}
	return true;
}

const init = function(config) {
	pixiApp = new PIXI.Application(config);
	return pixiApp;
};

const getPixiApp = function(cfg) {
	if (!pixiApp) {
		init(cfg);
	}
	return pixiApp;
};

export {
	detectPIXI,
	PIXI,
	getPixiApp
}
export default PIXI;