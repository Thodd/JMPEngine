jmp.use(["jmp/game/Engine", "jmp/game/World", "jmp/game/Entity"],
function(Engine, World, Entity) {

	Engine.start("content", "./src/manifest.json").then(function() {
		Engine.world = new World();

		Engine.world.clearLayers = [0, 1, 2];

		var e = new Entity();
		e.sprite = {
			sheet: "tileset",
			id: 0,
			offsetX: 0,
			offsetY: 0
		};
		e.layer = 1;

		e.added = function() {
			jmp.log("added");
		};

		e.removed = function() {
			jmp.log("removed");
			Engine.world.add(e);
		};

		e.update = function() {
			if (input.down(keys.LEFT)) this.x--;
			if (input.down(keys.RIGHT)) this.x++;
			if (input.down(keys.UP)) this.y--;
			if (input.down(keys.DOWN)) this.y++;
			if (input.pressed(keys.SPACE)) Engine.world.rem(this);
		};

		map.create({
			id: "overworld",
			sheet: "tileset",
			w: 50,
			h: 50
		});

		map.set("overworld", 1, 1, 35);

		var z = new Entity();
		z.iCol = 0;
		z.iCount = 0;
		z.iStep = 0.1;
		z.msg = " . JMP Rendering Engine . ";
		var fnFrameSkip = jmp.fc(2);
		z.render = function() {
			gfx.map("overworld", 0, 0, 0);

			gfx.clear(2);
			for (var i = 0; i < this.msg.length; i++) {
				var sChar = this.msg[i];
				gfx.text("font0", i * 7, 100 + Math.cos(i/3 + this.iCount) * Math.max(0, 30 - this.iCount), sChar, 2, gfx.pal[(this.iCol + i) % 15]);
			}
			this.iCount += this.iStep;

			if (fnFrameSkip()) {
				this.iCol++;
			}

		};
		Engine.world.add(z);

		Engine.world.add(e);
	});

});