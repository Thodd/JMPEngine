/**
 * Key-Frame definitions for Spear stabbing animation.
 * Also tracks the positioning of the hitbox for damaging enemies etc.
 */
const allFrames = {
	up: [
		{
			sprite: {sheet: "attacks", id: 18, offset: {x: -9, y: 0}},
			hitbox: { x:  0, y:   0, w: 8, h: 16 }
		},
		{
			sprite: {sheet: "attacks", id: 18, offset: {x: -6, y: -10}},
			hitbox: { x:  0, y: -10, w: 8, h: 16 }
		},
		{
			sprite: {sheet: "attacks", id: 18, offset: {x: -3, y: -16}},
			hitbox: { x:  0, y: -16, w: 8, h: 16 }
		}
	],
	down: [
		{
			sprite: {sheet: "attacks", id: 17, offset: {x: 10, y: 0}},
			hitbox: { x: 8, y:   0, w: 8, h: 16}
		},
		{
			sprite: {sheet: "attacks", id: 17, offset: {x: 7, y: 10}},
			hitbox: { x: 8, y:  10, w: 8, h: 16 }
		},
		{
			sprite: {sheet: "attacks", id: 17, offset: {x: 4, y: 16}},
			hitbox: { x: 8, y:  16, w: 8, h: 16 }
		}
	],
	left: [
		{
			sprite: {sheet: "attacks", id: 16, offset: {x: 0, y: 3}},
			hitbox: { x:   0, y: 8, w: 16, h: 8 }
		},
		{
			sprite: {sheet: "attacks", id: 16, offset: {x: -10, y: 3}},
			hitbox: { x: -10, y: 8, w: 16, h: 8 }
		},
		{
			sprite: {sheet: "attacks", id: 16, offset: {x: -17, y: 3}},
			hitbox: { x: -16, y: 8, w: 16, h: 8 }
		}
	],
	right: [
		{
			sprite: {sheet: "attacks", id: 15, offset: {x: 0, y: 3}},
			hitbox: { x:  0, y: 8, w: 16, h: 8 }
		},
		{
			sprite: {sheet: "attacks", id: 15, offset: {x: 10, y: 3}},
			hitbox: { x: 10, y: 8, w: 16, h: 8 }
		},
		{
			sprite: {sheet: "attacks", id: 15, offset: {x: 17, y: 3}},
			hitbox: { x: 16, y: 8, w: 16, h: 8 }
		}
	]
};

export default {
	allFrames: allFrames
};