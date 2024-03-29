let _totalLines = 0;

const speedTable = {
	0: 48,
	1: 43,
	2: 38,
	3: 33,
	4: 28,
	5: 23,
	6: 18,
	7: 13,
	8:  8,
	9:  6,
	10: 5,
	11: 5,
	12: 5,
	13: 4,
	14: 4,
	15: 4,
	16: 3,
	17: 3,
	18: 3,
	19: 2,
	20: 2,
	21: 2,
	22: 2,
	23: 2,
	24: 2,
	25: 2,
	26: 2,
	27: 2,
	28: 2,
	29: 1
};

const scoringTable = {
	1: 50,
	2: 150,
	3: 400,
	4: 1500
};

const Score = {
	points: 0,
	level: 0,

	levelIncreased: false,
	speed: speedTable[0],

	setLevel(l) {
		this.level = l;
		this.speed = speedTable[this.level];
		this.levelIncreased = true;
	},

	// lines
	addLines(v) {
		_totalLines += v;

		this.points += scoringTable[v] * (this.level + 1);

		if (_totalLines >= (this.level * 10 + 10)) {
			this.setLevel(this.level + 1);
		}
	},
	getLines() {return _totalLines},

	reset() {
		this.points = 0;
		this.setLevel(0);
		_totalLines = 0;
	},

	addHardDrop() {
		this.points += 10 + 100 * this.level;
	}

};

export default Score;