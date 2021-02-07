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

	/**
	 * Directions contain relative x/y-modifiers and names for all compass directions.
	 */
	Directions: {
		N:  {x: 0, y:-1, name: "north"},
		E:  {x: 1, y: 0, name: "east"},
		S:  {x: 0, y: 1, name: "south"},
		W:  {x:-1, y: 0, name: "west"},
		NE: {x: 1, y:-1, name: "north_east"},
		SE: {x: 1, y: 1, name: "south_east"},
		SW: {x:-1, y: 1, name: "south_west"},
		NW: {x:-1, y:-1, name: "north_west"}
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