import { log, warn, fail, error } from "./utils/Log.js";
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
 * Returns the entry under the given path in the Manifest.
 * If no path is given the whole manifest object is returned
 */
function get(path) {
	if (!path) {
		return _manifestObject;
	} else if (typeof path === "string") {
		// leading slash is ignored
		if (path[0] === "/") {
			path = path.slice(1, path.length);
		}
		// trailing slash is ignored
		if (path[path.length -1] === "/") {
			path = path.substr(0, path.length-1);
		}
		// navigate through manifest object
		let parts = path.split("/");
		let value = _manifestObject;
		for (let p of parts) {
			try {
				value = value[p];
			} catch(e) {
				fail(`invalid manifest path: ${path}`);
			}
		}
		return value;
	}
}

export default {
	DEFAULTS,
	init,
	resolve,
	get
};