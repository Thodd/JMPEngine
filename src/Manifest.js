import { log, warn, fail } from "./utils/Log.js";
import loadJSON from "./utils/loadJSON.js";
import Fonts from "./gfx/Fonts.js";

/**
 * Defaults for the Screen.
 */
const DEFAULTS = {
	w: 184,
	h: 136,
	scale: 2,
	layers: 8,
	fps: 60,
	hideCursor: false,
	spritesheets: {},
	fonts: {}
};


let initialized;
let _manifestObject;
let _baseURL = window.location; // default base

/**
 * Initialises the manifest.
 * Either a url string which is loaded by the bootstrap or the Engine.start function.
 * If the manifest is loaded from a JSON file, the Manifest.resolve function will
 * resolve URLs relative to the manifest location.
 * If a static object is given, all URLs will be resolved relative to the window.location.
 * @param {string|object|undefined} manifest the manifest
 */
async function init(manifest) {
	if (!initialized) {
		initialized = Promise.resolve().then(async function() {
			if (typeof manifest === "string") {
				log(`Loading Manifest from '${manifest}' ...`, "Manifest");
				_manifestObject = await loadJSON(manifest);

				// resolve manifest base URL
				let u = new URL(manifest, window.location);
				_baseURL = new URL(u.href.replace("manifest.json", ""));

			} else if (manifest && typeof manifest === "object") {
				log("Using manifest from static object. Cloning manifest ...", "Manifest");
				_manifestObject = JSON.parse(JSON.stringify(manifest));
			} else if (!manifest) {
				log("No manifest given. Using Engine defaults.", "Manifest");
			} else {
				fail(`Manifest ${manifest} is invalid! Only string and object values are supported.`, "Manifest");
			}

			assignDefaults();

			return _manifestObject;
		});
	} else {
		warn("Already initialized!", "Manifest");
		return initialized;
	}

	return initialized;
}

function assignDefaults() {
	// assign good default values for the manifest,
	// no matter from what source we got it
	_manifestObject = Object.assign(DEFAULTS, _manifestObject);

	// at least define the default font 'font0'
	_manifestObject.fonts["font0"] = {
		"url": Fonts.DEFAULT_JMP_FONT,
		"w": 7,
		"h": 8
	};
}

/**
 * Resolves the given URL string relative to the manifest location.
 * @param {string} url the URL which will be resolved relative to he manifest location
 */
function resolve(url) {
	return new URL(url, _baseURL);
}

/**
 * Returns the loaded and parsed manifest.json.
 * Or the statically defined manifest object.
 */
function get() {
	return _manifestObject;
}

export default {
	DEFAULTS,
	init,
	resolve,
	get
};