import domReady from "./utils/domReady.js";
import Engine from "./core/Engine.js";

domReady().then(() => {

	// find manifest bootstrap URL
	let bootstrapScriptElement = document.querySelectorAll("script[data-jmp-manifest]")[0];

	if (bootstrapScriptElement) {
		let containerID = bootstrapScriptElement.dataset.jmpContainer;

		let containerDOM = document.getElementById(containerID);

		// start engine from manifest url
		let manifestURL = bootstrapScriptElement.dataset.jmpManifest;

		Engine.start({
			placeAt: containerDOM,
			manifest: manifestURL
		});
	}
});