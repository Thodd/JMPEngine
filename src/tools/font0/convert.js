import domReady from "../../utils/domReady.js";

domReady().then(() => {
	let fontImg = document.getElementById("jmp_font");
	let output = document.getElementById("output");

	let c = document.createElement("canvas");
	c.width = fontImg.width;
	c.height = fontImg.height;

	c.getContext("2d").drawImage(fontImg, 0, 0);

	output.textContent = c.toDataURL();
});