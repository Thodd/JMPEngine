const Events = {
	// fired each time the player is finished with their turn
	END_OF_PLAYER_TURN: "END_OF_PLAYER_TURN",

	// fired each time the backpack content of the player changes
	BACKPACK_CHANGED: "BACKPACK_CHANGED",

	// fired each time a stat change happens for the player
	STATS_CHANGED: "STATS_CHANGED",

	// used for logging stuff in the history
	HISTORY: "HISTORY"
};

export default Events;