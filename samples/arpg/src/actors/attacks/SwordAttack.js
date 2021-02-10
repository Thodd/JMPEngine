/**
 * Key-Frame definitions for Sword slashing animation.
 * Also tracks the positioning of the hitbox for damaging enemies etc.
 */
const allFrames = {
	up: [
		{
			sprite: {sheet: "attacks", id: 4, offset: {x: 15, y: 0}},
			hitbox: { x:  13, y:   0 }
		},
		{
			sprite: {sheet: "attacks", id: 2, offset: {x: 11, y: -14}},
			hitbox: { x:  13, y: -13 }
		},
		{
			sprite: {sheet: "attacks", id: 1, offset: {x: -4, y: -16}},
			hitbox: { x:   0, y: -14 }
		}
	],
	down: [
		{
			sprite: {sheet: "attacks", id: 3, offset: {x: -16, y: 0}},
			hitbox: { x: -16, y:   0 }
		},
		{
			sprite: {sheet: "attacks", id: 5, offset: {x: -11, y: 14}},
			hitbox: { x: -13, y:  13 }
		},
		{
			sprite: {sheet: "attacks", id: 6, offset: {x: +4, y: 17}},
			hitbox: { x:   0, y:  16 }
		}
	],
	left: [
		{
			sprite: {sheet: "attacks", id: 1, offset: {x: 0, y: -16}},
			hitbox: { x:   0, y: -14 }
		},
		{
			sprite: {sheet: "attacks", id: 0, offset: {x: -14, y: -11}},
			hitbox: { x: -13, y: -13 }
		},
		{
			sprite: {sheet: "attacks", id: 3, offset: {x: -17, y: 2}},
			hitbox: { x: -15, y:   0 }
		}
	],
	right: [
		{
			sprite: {sheet: "attacks", id: 8, offset: {x: 1, y: -16}},
			hitbox: { x:   0, y: -16 }
		},
		{
			sprite: {sheet: "attacks", id: 7, offset: {x: 14, y: -11}},
			hitbox: { x: +13, y: -13 }
		},
		{
			sprite: {sheet: "attacks", id: 9, offset: {x: 17, y: +2}},
			hitbox: { x:  14, y:   0 }
		}
	]
};

export default {
	allFrames: allFrames
};