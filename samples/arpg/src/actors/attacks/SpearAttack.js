/**
 * Key-Frame definitions for Spear stabbing animation.
 * Also tracks the positioning of the hitbox for damaging enemies etc.
 */
const allFrames = {
	up: [
		{
			sprite: {sheet: "attacks", id: 18, offset: {x: -9, y: 0}},
			hitbox: { x:  0, y:   0 }
		},
		{
			sprite: {sheet: "attacks", id: 18, offset: {x: -6, y: 0}},
			hitbox: { x:  0, y: -10 }
		},
		{
			sprite: {sheet: "attacks", id: 18, offset: {x: -3, y: 1}},
			hitbox: { x:  0, y: -18 }
		}
	],
	down: [
		{
			sprite: {sheet: "attacks", id: 17, offset: {x: 10, y: 0}},
			hitbox: { x: 0, y:   0 }
		},
		{
			sprite: {sheet: "attacks", id: 17, offset: {x: 7, y: 0}},
			hitbox: { x: 0, y:  10 }
		},
		{
			sprite: {sheet: "attacks", id: 17, offset: {x: 4, y: 0}},
			hitbox: { x: 0, y:  18 }
		}
	],
	left: [
		{
			sprite: {sheet: "attacks", id: 16, offset: {x: 0, y: 3}},
			hitbox: { x:   0, y: 0 }
		},
		{
			sprite: {sheet: "attacks", id: 16, offset: {x: 0, y: 3}},
			hitbox: { x: -10, y: 0 }
		},
		{
			sprite: {sheet: "attacks", id: 16, offset: {x: 0, y: 3}},
			hitbox: { x: -18, y: 0 }
		}
	],
	right: [
		{
			sprite: {sheet: "attacks", id: 15, offset: {x: 0, y: 3}},
			hitbox: { x:  0, y: 0 }
		},
		{
			sprite: {sheet: "attacks", id: 15, offset: {x: 0, y: 3}},
			hitbox: { x: 10, y: 0 }
		},
		{
			sprite: {sheet: "attacks", id: 15, offset: {x: 0, y: 3}},
			hitbox: { x: 18, y: 0 }
		}
	]
};

export default {
	allFrames: allFrames
};