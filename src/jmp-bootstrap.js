import domReady from "./utils/domReady.js";
import Engine from "./Engine.js";

domReady().then(() => {
	// find manifest bootstrap URL
	let bootstrapDOM = document.querySelectorAll("div[data-jmp-manifest]")[0];

	if (bootstrapDOM) {

		// generate ID if necessary
		bootstrapDOM.id = bootstrapDOM.id || "__jmp__main";

		// start engine from manifest url
		let manifestURL = bootstrapDOM.dataset.jmpManifest;

		Engine.start({
			placeAt: bootstrapDOM.id,
			manifest: manifestURL
		});
	}
});