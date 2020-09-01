const _cache = {};

/**
 * Caches the JSON files loaded via the AssetLoader.
 * Similar to the Spritesheet and Fonts Cache.
 */
const JSONCache = {

	/**
	 * Stores the given object under the given name.
	 * Beware: this is still an object reference. There will be no cloning!
	 *
	 * @param {string} name the name under which the json data is stored
	 * @param {object} data json object
	 */
	add(name, data) {
		_cache[name] = data;
		return data;
	},

	/**
	 * Returns the cache object stored under given name.
	 *
	 * Beware:
	 * This object might change!
	 * All code parts accessing the same object are affected. There is no cloning!
	 * @param {string} name name of the cached object
	 */
	get(name) {
		return _cache[name];
	},

	/**
	 * Releases the named JSON resource.
	 * Useful for big objects so the garbage collection can remove them.
	 * IMPORTANT: This only works if you don't keep a reference on the resource yourself!
	 * @param {string} name the name of the resource
	 */
	release(name) {
		delete _cache[name];
		_cache[name] = null;
	}
};



export default JSONCache;