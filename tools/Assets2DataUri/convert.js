import domReady from "../../src/utils/domReady.js";

domReady().then(() => {
	let assets = document.querySelectorAll("[data-jmp-asset]");
	assets.forEach((assetImg) => {
		let output = document.createElement("textarea");

		let c = document.createElement("canvas");
		c.width = assetImg.width;
		c.height = assetImg.height;

		c.getContext("2d").drawImage(assetImg, 0, 0);

		output.textContent = c.toDataURL();

		assetImg.parentNode.insertBefore(output, assetImg);
	});
});