const Constants = {
	MAP_WIDTH:   31,
	MAP_HEIGHT:  31,

	TILE_WIDTH:  16,
	TILE_HEIGHT: 16,

	Layers: {
		TILES: 0,
		ENEMIES: 1,
		PLAYER_UNDER: 2,
		PLAYER: 3,
		PLAYER_OVER: 4,
		SKY: 5,
		UI: 7
	},

	Directions: {
		N:  {x: 0, y:-1},
		E:  {x: 1, y: 0},
		S:  {x: 0, y: 1},
		W:  {x:-1, y:0},
		NE: {x: 1, y:-1},
		SE: {x: 1, y: 1},
		SW: {x:-1, y: 1},
		NW: {x:-1, y:-1},
		/**
		 * Names for all compass directions.
		 * Can be used for logging or animation naming.
		 */
		Names: {
			N:  "north",
			E:  "east",
			S:  "south",
			W:  "west",
			NE: "north_east",
			SE: "south_east",
			SW: "south_west",
			NW: "north_west"
		}
	}
};

// arrays with all compass directions
// ALL, cardinal and diagonal
// can be used to easily pick a random direction
Constants.Directions.ALL = [
	Constants.Directions.N,
	Constants.Directions.E,
	Constants.Directions.S,
	Constants.Directions.W,
	Constants.Directions.NE,
	Constants.Directions.SE,
	Constants.Directions.SW,
	Constants.Directions.NW
];

Constants.Directions.CARDINAL = [
	Constants.Directions.N,
	Constants.Directions.E,
	Constants.Directions.S,
	Constants.Directions.W
];

Constants.Directions.DIAGONAL = [
	Constants.Directions.NE,
	Constants.Directions.SE,
	Constants.Directions.SW,
	Constants.Directions.NW
];

export default Constants;