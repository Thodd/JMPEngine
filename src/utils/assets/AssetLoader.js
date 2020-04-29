import { log } from "../Log.js";
import Manifest from "../../Manifest.js";
import loadImage from "./plugins/loadImage.js";


function load(assets) {
	// loading
	function loadResources(type) {
		let resPromises = [];
		// get map of all assets of the given type
		let resources = assets[type];

		for (let resourceID in resources) {
			let res = resources[resourceID];
			res.id = resourceID;
			res.url = Manifest.resolve(res.url)
			// trigger loading
			resPromises.push(loadImage(res).then((rawImg) => {
				// store loaded raw image in manifest asset object
				res.raw = rawImg;
				log("  > loaded: " + res.url + " (" + type + ")", "AssetLoader");
			}));
		}
		return resPromises;
	}

	log("Preloading assets ...", "AssetLoader");

	let allAssets = [];

	for (let type in assets) {
		allAssets = allAssets.concat(loadResources(type));
	}

	return Promise.all(allAssets).then(() => {
		log("All sprites & fonts loaded.", "AssetLoader");
	});
}

export default {
	load
};