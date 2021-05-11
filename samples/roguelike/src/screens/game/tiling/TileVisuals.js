import Colors from "../../../Colors.js";
import { char2id } from "../../../utils/RLTools.js";

const TileVisuals = {

	VOID: {
		id: char2id("◙"),
		color: Colors[0]
	},

	FLOOR: {
		variants: [
			{
				id: char2id("·"),
				color: Colors[1]
			},
			{
				id: char2id("."),
				color: Colors[1]
			},
			{
				id: char2id(","),
				color: Colors[1]
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