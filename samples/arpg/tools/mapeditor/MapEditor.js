import domReady from "../../../../src/utils/domReady.js";
import { log } from "../../../../src/utils/Log.js";
import EventBus from "../../../../src/utils/EventBus.js";
import TileChooser from "./TileChooser.js";
import TileProperties from "./TileProperties.js";

const MapEditor = {
    chosenTile: {
        id: 0,
        x: 0,
        y: 0
    },
    TileChooser: null
};

domReady().then(() => {
    MapEditor.TileChooser = new TileChooser();
    MapEditor.TileProperties = new TileProperties();
});

export default MapEditor;