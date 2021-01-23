
const getTemplate = function(id) {
    return `
        <div class="wnd_title" id="wnd_title_${id}">
        </div>
        <div class="wnd_content" id="wnd_content_${id}">
        </div>
    `;
}

let _ID = 0;

class Wnd {
    constructor(id) {

        this._id = id || _ID++;

        this._dom = {
            container: document.createElement("div")
        };

        this._dom.container.id = "wnd_" + this._id;
        this._dom.container.className = "wnd";

        this._dom.container.insertAdjacentHTML("afterbegin", getTemplate(this._id));
        document.body.appendChild(this._dom.container);

        this._dom.title = document.getElementById("wnd_title_"+this._id);
        this._dom.content = document.getElementById("wnd_content_"+this._id);
    }

    set title(v) {
        this._dom.title.innerText = v;
    }

    get title() {
        return this._dom.title.textContent;
    }

    getContentDOM() {
        return this._dom.content;
    }
}

export default Wnd;