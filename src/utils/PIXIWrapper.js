// global pixi namespace
const PIXI = window.PIXI;

// the main PIXI.Application instance
let pixiApp;

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
	PIXI,
	getPixiApp
}
export default PIXI;