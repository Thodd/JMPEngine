import { char2id } from "../utils/RLTools.js";

/**
 * Base TileType class.
 */
class TileType {
	constructor(spec) {
		this.name = spec.name;
		this.isWalkable = spec.isWalkable != undefined ? spec.isWalkable : true;
		this.blocksLight = spec.blocksLight != undefined ? spec.blocksLight : false;
		this.visuals = spec.visuals || {
			id: 0,
			color: 0xFFFFFF
		};

		// TODO: sanity check if spec is a valid definition
	}
}

/**
 * Default TileType VOID
 */
TileType.VOID = new TileType({
	name: "VOID",
	isWalkable: true,
	blocksLight: false,
	visuals: {
		id: char2id("◙"),
		color: 0xFF0085
	}
});

export default TileType;