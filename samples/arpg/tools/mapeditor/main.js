import domReady from "../../../../src/utils/domReady.js";
import TileChooser from "./TileChooser.js";

domReady().then(() => {
    let tc = new TileChooser();
    tc.onClick((x, y) => {
        console.log(`click tile: (${x}, ${y})`);
    })
});