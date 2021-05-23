// engine imports
import { char2id } from "../../engine/utils/RLTools.js";

// gamecontent imports
import Colors from "../../gamecontent/Colors.js";

/**
 * Defines the visuals of each tile.
 */
const TileVisuals = {

	FLOOR: {
		variants: [
			{
				id: char2id("·"),
				color: Colors[11]
			},
			{
				id: char2id("."),
				color: Colors[1]
			},
			{
				id: char2id(","),
				color: Colors[11]
			},
			{
				id: char2id(","),
				color: Colors[12]
			}
		],
		probability: 0.1
	},

	TREE: {
		variants: [
			{
				id: char2id("♠"),
				color: Colors[11]
			},
			{
				id: char2id("♣"),
				color: Colors[12]
			},
			{
				id: char2id("φ"),
				color: Colors[11]
			}
		],
		probability: 0.05
	}

}

export default TileVisuals;