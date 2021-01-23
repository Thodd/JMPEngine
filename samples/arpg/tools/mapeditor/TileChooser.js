import EventBus from "../../../../src/utils/EventBus.js";
import Constants from "./Constants.js";
class TileChooser {
    constructor() {
        // dom elements
        this._contentDOM = document.getElementById("tc_content");
        this._cursor = document.getElementById("tc_cursor");

        // add cursor movement to tileset
        this._contentDOM.firstElementChild.addEventListener("mousemove", (event) => {
            event.stopPropagation();
            event.preventDefault();

            let bounds = this._contentDOM.getBoundingClientRect();

            let newX = (event.clientX - bounds.left);
            let newY = (event.clientY - bounds.top);

            newX -= (newX % Constants.TILE_WIDTH);
            newY -= (newY % Constants.TILE_HEIGHT);

            this._cursor.tile_x = newX / Constants.TILE_WIDTH;
            this._cursor.tile_y = newY / Constants.TILE_HEIGHT;

            this._cursor.style.left = newX + "px";
            this._cursor.style.top = newY + "px";

            return false;
        });

        // add click on tile
        this._cursor.addEventListener("contextmenu", (event) => {
            // we ignore a right-click
            event.preventDefault();
        });
        this._cursor.addEventListener("click", (event) => {
            event.preventDefault();

            EventBus.publish("TILE_CHANGE", {
                x: this._cursor.tile_x,
                y: this._cursor.tile_y,
                id: this._cursor.tile_y * Constants.TILES_PER_ROW + this._cursor.tile_x
            });
        });
    }

    getTilesetImage() {
        return this._contentDOM.firstElementChild;
    }
}

export default TileChooser;