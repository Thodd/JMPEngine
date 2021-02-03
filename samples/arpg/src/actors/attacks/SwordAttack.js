/**
 * Key-Frame definitions for Sword slashing animation.
 * Also tracks the positioning of the hitbox for damaging enemies etc.
 */
const allFrames = {
	up: [
		{
			sprite: {sheet: "attacks", id: 4},
			hitbox: { x:  16, y:   0 }
		},
		{
			sprite: {sheet: "attacks", id: 2, offset: {x: -3, y: +2}},
			hitbox: { x:  16, y: -16 }
		},
		{
			sprite: {sheet: "attacks", id: 1, offset: {x: -4}},
			hitbox: { x:   0, y: -16 }
		}
	],
	down: [
		{
			sprite: {sheet: "attacks", id: 3},
			hitbox: { x: -16, y:   0 }
		},
		{
			sprite: {sheet: "attacks", id: 5, offset: {x: +4, y: -2}},
			hitbox: { x: -16, y:  16 }
		},
		{
			sprite: {sheet: "attacks", id: 6, offset: {x: +4, y: +1}},
			hitbox: { x:   0, y:  16 }
		}
	],
	left: [
		{
			sprite: {sheet: "attacks", id: 1},
			hitbox: { x:   0, y: -16 }
		},
		{
			sprite: {sheet: "attacks", id: 0, offset: {x: 0, y: +3}},
			hitbox: { x: -16, y: -16 }
		},
		{
			sprite: {sheet: "attacks", id: 3, offset: {x: 0, y: +2}},
			hitbox: { x: -18, y:   0 }
		}
	],
	right: [
		{
			sprite: {sheet: "attacks", id: 8},
			hitbox: { x:   0, y: -16 }
		},
		{
			sprite: {sheet: "attacks", id: 7, offset: {x: -1, y: +3}},
			hitbox: { x: +16, y: -16 }
		},
		{
			sprite: {sheet: "attacks", id: 9, offset: {x: +2, y: +2}},
			hitbox: { x:  16, y:   0 }
		}
	]
};

export default {
	allFrames: allFrames
};