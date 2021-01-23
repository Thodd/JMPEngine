import EventBus from "../../../../src/utils/EventBus.js";
import TilesetModel from "./TilesetModel.js";

class TileProperties {
    constructor() {
        EventBus.subscribe("TILE_CHANGE", function(evt) {
            // evt.data.x;
            // evt.data.y;
            // evt.data.id;
        });
    }
}

export default TileProperties;