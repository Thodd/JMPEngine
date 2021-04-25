import domReady from "../../src/utils/domReady.js";

domReady().then(() => {
	let fonts = document.querySelectorAll("[data-jmp-font]");
	fonts.forEach((fontImg) => {
		let output = document.createElement("textarea");

		let c = document.createElement("canvas");
		c.width = fontImg.width;
		c.height = fontImg.height;

		c.getContext("2d").drawImage(fontImg, 0, 0);

		output.textContent = c.toDataURL();

		fontImg.parentNode.insertBefore(output, fontImg);
	});
});