import Spritesheets from "../../../../../src/assets/Spritesheets.js";

// map to store the spritesheets
let _iconSheets = {
	"items": null,
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
			let sheet = Spritesheets.getSheet(sheetName);
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

	getIconDOM(sheetName, id, scale=2) {
		let iconInfo = IconsPool.getIconInfo(sheetName, id);
		return `<img src="${iconInfo.dataUrl}" style="width: ${iconInfo.w*scale}px; height: ${iconInfo.h*scale}px; image-rendering: pixelated;" draggable="false" />`;
	}
};


export default IconsPool;