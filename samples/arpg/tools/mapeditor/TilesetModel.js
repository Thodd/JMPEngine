const _model = {};

const TilesetModel = {
    get(id) {
        if (!_model[id]) {
            _model[id] = {};
        }
        return _model[id];
    },

    export() {
        return JSON.stringify(_model);
    }
};

export default TilesetModel;