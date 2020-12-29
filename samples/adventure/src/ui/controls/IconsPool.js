import Spritesheets from "../../../../../src/assets/Spritesheets.js";

let _iconSheets = {
	"items": Spritesheets.getSheet("items"),
	"buttons": null
};


// map for icons
const _iconInfos = {
	"items": {},
	"buttons": {}
};

const IconsPool = {
	getIconInfo(sheetName, id) {
		let iconInfo = _iconInfos[sheetName][id];

		// icon not yet converted to data url
		if (!iconInfo) {
			let sheet = _iconSheets[sheetName];
			let frame = sheet.textures[id].frame;

			// crop image to icon format
			let can = document.createElement("canvas");
			can.width = frame.width;
			can.height = frame.height;
			can.getContext("2d").drawImage(
				sheet.rawImage,
				frame.x,
				frame.y,
				frame.width,
				frame.height,
				0,
				0,
				frame.width,
				frame.height);

			_iconInfos[sheetName][id] = iconInfo = {
				canvas: can,
				dataUrl: can.toDataURL(),
				w: frame.width,
				h: frame.height
			};
		}

		return iconInfo;
	},

	getIconDOM(sheetName, id) {
		let iconInfo = IconsPool.getIconInfo(sheetName, id);
		return `<img src="${iconInfo.dataUrl}" style="width: ${iconInfo.w*2}px; height: ${iconInfo.h*2}px; image-rendering: pixelated;" draggable="false" />`;
	}
};


export default IconsPool;