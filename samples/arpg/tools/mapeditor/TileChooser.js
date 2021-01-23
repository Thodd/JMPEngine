class TileChooser {
    constructor() {

        // listeneres
        this._onClickListeners = [];

        this._contentDOM = document.getElementById("tc_content");
        this._cursor = document.getElementById("tc_cursor");

        // add cursor movement to tileset
        this._contentDOM.firstElementChild.addEventListener("mousemove", (event) => {
            event.stopPropagation();
            event.preventDefault();

            let bounds = this._contentDOM.getBoundingClientRect();

            let newX = (event.clientX - bounds.left);
            let newY = (event.clientY - bounds.top);

            newX -= (newX % 16);
            newY -= (newY % 16);

            this._cursor.tile_x = newX / 16;
            this._cursor.tile_y = newY / 16;

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

            this._onClickListeners.forEach((listener) => {
                listener(this._cursor.tile_x, this._cursor.tile_y);
            })
        });
    }

    getTilesetImage() {
        return this._contentDOM.firstElementChild;
    }

    onClick(listener) {
        this._onClickListeners.push(listener);
    }
}

export default TileChooser;