import { log, warn, fail } from "../utils/Log.js";
import { exposeOnWindow } from "../utils/Helper.js";
import PIXI from "../core/PIXIWrapper.js";

/**
 * Defaults for the Screen.
 */
const DEFAULTS = {
	w: 160,
	h: 144,
	scale: 1,
	layers: 7,
	fps: 60,
	startScreen: null,
	hideCursor: false,
	skipIntro: false,
	assets: {}
};


let initialized;
let _manifestObject;
let _baseURL = window.location; // default base

// @PIXI: we just use a PIXI.Loader to load our manifest.json, wrapped in a promise so we can use the await-syntax
async function loadJSON(cfg) {
	return new Promise((res) => {
		let loader = new PIXI.Loader();
		loader.add("manifest", cfg.url);
		loader.load((l, resources) => {
			res(resources["manifest"].data);
		});
	});
}

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
				_manifestObject = await loadJSON({
					url: manifest
				});

				// resolve manifest base URL
				let u = new URL(manifest, window.location);
				// get manifest.json file name
				// BEWARE: URL parameters and search query is not taken care of!
				let s = u.href.substr(u.href.lastIndexOf("/")+1);
				_baseURL = new URL(u.href.replace(s, ""));

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
}

/**
 * Resolves the given URL string relative to the manifest location.
 * @param {string} url the URL which will be resolved relative to he manifest location
 */
function resolve(url) {
	return new URL(url, _baseURL);
}

/**
 * Returns the base URL.
 * Relative to the manfifest.json.
 * @returns {URL} the base URL instance
 */
function getBaseUrl() {
	return _baseURL;
}

function _splitPath(path) {
	if (path[0] !== "/") {
		fail(`Manifest path has to start with a '/': path was '${path}'`, "Manifest");
	}
	path = path.substr(1, path.length);

	// trailing slash is ignored
	if (path[path.length -1] === "/") {
		path = path.substr(0, path.length-1);
	}
	// navigate through manifest object
	return path.split("/");
}

/**
 * Returns the entry under the given path in the Manifest.
 * If no path is given the whole manifest object is returned
 * @param {string} path the path through the Manifest object. Must start with a "/".
 */
function get(path, failOnError=true) {
	if (!path || path === "/") {
		return _manifestObject;
	} else if (typeof path === "string") {
		let parts = _splitPath(path);
		let value = _manifestObject;
		for (let p of parts) {
			try {
				value = value[p];
			} catch(e) {
				if (failOnError) {
					fail(`invalid manifest path: ${path}`, "Manifest");
				}
				return; // if failOnError is false, we return undefined
			}
		}
		return value;
	}
}

function set(path, value) {
	if (path) {
		let parts = _splitPath(path);
		let last = parts.pop();
		let cur = _manifestObject;
		for (let p of parts) {
			cur = cur[p] || {};
		}
		cur[last] = value;
	}
}

exposeOnWindow("Manifest", {
	get: get
});

export default {
	DEFAULTS,
	init,
	resolve,
	getBaseUrl,
	get,
	set
};