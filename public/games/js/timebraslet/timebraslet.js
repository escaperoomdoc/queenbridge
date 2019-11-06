const screenWidth = 1280;
const screenHeight = 720;
qb = new QueenBridge(location.host, {id: 'timebraslet-'+gameParams});
var app = new PIXI.Application(screenWidth, screenHeight, { transparent: true });
document.body.appendChild(app.view);

colors = {};
colors['red'] = 0xFF0000;
colors['green'] = 0x00FF00;
colors['blue'] = 0x0000FF;
colors['yellow'] = 0xFFFF00;
colors['purple'] = 0xFF00FF;
colors['cyan'] = 0x00FFFF;
colorNames=['red', 'green', 'blue', 'yellow', 'purple', 'cyan'];

// create a new Sprite from an image path.
var Frame = function() {
	// init members
	this.bg = PIXI.Sprite.fromImage('js/timebraslet/bg.png');
	this.bg.anchor.set(0.5);
	this.bg.x = screenWidth / 2;
	this.bg.y = screenHeight / 2;
	this.activeSprites = false;
	this.activate = function() {
		this.activeSprites = true;
		this.bg.gameProperty = "frame";
		app.stage.addChild(this.bg);
	}
	this.deactivate = function() {
		this.activeSprites = false;
		for (var i = app.stage.children.length - 1; i >= 0; i--) {
			if (app.stage.children[i].gameProperty === "frame") app.stage.removeChild(app.stage.children[i]);
		};	
	}
	this.animate = function() {
	}
};

var textStyleTime = new PIXI.TextStyle({
	fontFamily: 'Arial',	//'Berlin Sans FB', 'Candara'
	fontSize: 120,
	fontStyle: 'normal',
	fontWeight: 'normal',
	fill: ['#28ff20']
});

var textStylePass = new PIXI.TextStyle({
	fontFamily: 'Arial',
	fontSize: 120,
	fontStyle: 'normal',
	fontWeight: 'normal',
	fill: ['#606060']
});

var textStyleZone = new PIXI.TextStyle({
	fontFamily: 'Courier New',
	fontSize: 80,
	fontStyle: 'normal',
	fontWeight: 'normal',
	fill: ['#ffffff']
});

String.prototype.padLeft = function (length, character) { 
     return new Array(length - this.length + 1).join(character || '0') + this; 
}

var Time = function(time, style, x, y, gameProperty, interactive) {
	this.textSprite = new PIXI.Text('9999∙99∙99 99∙99∙99', style);
	this.textSprite.x = x;
	this.textSprite.y = y;
	this.updateText = function() {
		this.text  = this.time.years.toString().padLeft(4, '0');
		this.text += '∙';
		this.text += this.time.months.toString().padLeft(2, '0');
		this.text += '∙';
		this.text += this.time.days.toString().padLeft(2, '0');
		this.text += ' ';
		this.text += this.time.hours.toString().padLeft(2, '0');
		this.text += '∙';
		this.text += this.time.mins.toString().padLeft(2, '0');
		this.text += '∙';
		this.text += this.time.secs.toString().padLeft(2, '0');
		this.textSize = this.text.length;
		this.textSprite.text = this.text;
	}	
	this.time = {};
	this.setTime = function(value) {
		this.time.raw = value;
		this.time.mins = Math.floor(value / 60);
		this.time.secs = value - this.time.mins * 60;
		this.time.hours = Math.floor(this.time.mins / 60);
		this.time.mins = this.time.mins - this.time.hours * 60;
		this.time.days = Math.floor(this.time.hours / 24);
		this.time.hours = this.time.hours - this.time.days * 24;
		this.time.months = Math.floor(this.time.days / 30);
		this.time.days = this.time.days - this.time.months * 30;
		this.time.years = Math.floor(this.time.months / 12);
		this.time.months = this.time.months - this.time.years * 12;
		this.updateText();
	}
	this.setTime(time);
	
	this.pointInRect = function(x, y, l, t, w, h) {
		if (x >= l && x <= l + w && y >= t && y <= t + h) return true;
		return false;
	}
	if (interactive) {
		this.textSprite.interactive = true;
		this.textSprite.buttonMode = true;	
		this.textSprite.on('pointertap', (event ) => {
			if (this.pointInRect(event.data.global.x, event.data.global.y, 80, 500, 270, 120)) {
				if (++this.time.years > 9999) this.time.years = 0;
			}
			if (this.pointInRect(event.data.global.x, event.data.global.y, 380, 500, 135, 120)) {
				if (++this.time.months > 11) this.time.months = 0;
			}
			if (this.pointInRect(event.data.global.x, event.data.global.y, 550, 500, 135, 120)) {
				if (++this.time.days > 29) this.time.days = 0;
			}
			if (this.pointInRect(event.data.global.x, event.data.global.y, 710, 500, 135, 120)) {
				if (++this.time.hours > 23) this.time.hours = 0;
			}
			if (this.pointInRect(event.data.global.x, event.data.global.y, 880, 500, 135, 120)) {
				if (++this.time.mins > 59) this.time.mins = 0;
			}
			if (this.pointInRect(event.data.global.x, event.data.global.y, 1050, 500, 135, 120)) {
				if (++this.time.secs > 59) this.time.secs = 0;
			}
			value = 	this.time.secs + this.time.mins * 60 + this.time.hours * 3600 +
						this.time.days * 86400 + this.time.months * 2592000 + this.time.years * 31104000;
			this.setTime(value);
		});	
	}
	this.activeSprites = false;
	this.activate = function() {
		this.activeSprites = true;
		this.textSprite.gameProperty = gameProperty;
		app.stage.addChild(this.textSprite);
	}
	this.deactivate = function() {
		this.activeSprites = false;
		for (var i = app.stage.children.length - 1; i >= 0; i--) {
			if (app.stage.children[i].gameProperty === gameProperty) app.stage.removeChild(app.stage.children[i]);
		};	
	}
	this.animate = function() {
	}	
};

var Text = function(text, style, x, y, gameProperty) {
	this.textSprite = new PIXI.Text(text, style);
	this.textSprite.x = x;
	this.textSprite.y = y;
	this.setText = function(text) {
		this.text = text;
		this.textSize = this.text.length;
		this.textSprite.text = this.text;
	}	
	this.setText(text);
	this.activeSprites = false;
	this.activate = function() {
		this.activeSprites = true;
		this.textSprite.gameProperty = gameProperty;
		app.stage.addChild(this.textSprite);
	}
	this.deactivate = function() {
		this.activeSprites = false;
		for (var i = app.stage.children.length - 1; i >= 0; i--) {
			if (app.stage.children[i].gameProperty === gameProperty) app.stage.removeChild(app.stage.children[i]);
		};	
	}
	this.animate = function() {
	}	
}

var indiIcon = function(colorName, x, y, radius) {
	this.color = colors[colorName];
	this.colorNow = this.color;
	this.graphics = new PIXI.Graphics();
	this.draw = function() {
		this.graphics.clear();
		this.graphics.lineStyle(0);
		this.graphics.beginFill(this.colorNow, 1);
		this.graphics.drawCircle(x, y, radius);
		this.graphics.endFill();
	}
	this.draw();
	this.activate = function() {
		this.activeSprites = true;
		this.graphics.gameProperty = "indi";
		app.stage.addChild(this.graphics);
	}
	this.deactivate = function() {
		this.activeSprites = false;
		for (var i = app.stage.children.length - 1; i >= 0; i--) {
			if (app.stage.children[i].gameProperty === "indi") app.stage.removeChild(app.stage.children[i]);
		};	
	}	
	this.restoreColor = function() {
		if (this.activeSprites) {
			this.colorNow = this.color;
			this.draw();
		}
	}
	this.animate = function() {
		if (qb.connected && this.activeSprites) {
			this.colorNow = this.colorNow - (this.colorNow & 0xFF0000 ? 0x010000 : 0);
			this.colorNow = this.colorNow - (this.colorNow & 0x00FF00 ? 0x000100 : 0);
			this.colorNow = this.colorNow - (this.colorNow & 0x0000FF ? 0x000001 : 0);
			this.draw();
		}
	}
}

var Button = function(x, y, gameProperty) {
	this.button = PIXI.Sprite.fromImage('js/timebraslet/' + gameProperty + '.png');
	this.button.anchor.set(0);
	this.button.x = x;
	this.button.y = y;
	this.button.interactive = true;
	this.button.buttonMode = true;
	this.button.on('pointertap', () => {
		buttonTap(this.button.gameProperty);
	});
	this.activeSprites = false;
	this.activate = function() {
		this.activeSprites = true;
		this.button.gameProperty = gameProperty;
		app.stage.addChild(this.button);
	}
	this.deactivate = function() {
		this.activeSprites = false;
		for (var i = app.stage.children.length - 1; i >= 0; i--) {
			if (app.stage.children[i].gameProperty === gameProperty) app.stage.removeChild(app.stage.children[i]);
		};	
	}
	this.animate = function() {
	}
}

var Arrow = function(x, y, gameProperty) {
	this.onTap = function() {
		console.log(123);
	}
	this.colorIndex = 0;
	this.color = colors[colorNames[this.colorIndex]];
	this.x = x;
	this.y = y;
	this.graphics = new PIXI.Graphics();
	this.graphics.interactive = true;
	this.graphics.buttonMode = true;	
	this.colorNow = this.color;
	this.draw = function() {
		this.graphics.beginFill(this.colorNow);
		this.graphics.lineStyle(4, this.colorNow, 1);
		this.graphics.moveTo(this.x - 30, this.y - 50);
		this.graphics.lineTo(this.x - 30, this.y + 20);
		this.graphics.lineTo(this.x - 80, this.y + 20);
		this.graphics.lineTo(this.x +  0, this.y + 80);
		this.graphics.lineTo(this.x + 80, this.y + 20);
		this.graphics.lineTo(this.x + 30, this.y + 20);
		this.graphics.lineTo(this.x + 30, this.y - 50);
		this.graphics.closePath();
		this.graphics.endFill();
	}
	this.draw();
	this.graphics.on('pointertap', () => {
		if (++this.colorIndex >= colorNames.length) this.colorIndex = 0;
		this.color = colors[colorNames[this.colorIndex]];
		this.colorNow = this.color;
		this.draw();
	});	
	this.restoreColor = function() {
		this.colorNow = this.color;
		this.draw();
	}	
	this.activate = function() {
		this.activeSprites = true;
		this.graphics.gameProperty = gameProperty;
		app.stage.addChild(this.graphics);
	}
	this.deactivate = function() {
		this.activeSprites = false;
		for (var i = app.stage.children.length - 1; i >= 0; i--) {
			if (app.stage.children[i].gameProperty === gameProperty) app.stage.removeChild(app.stage.children[i]);
		};	
	}
	this.animate = function() {
		if (this.activeSprites) {
			this.colorNow = this.colorNow - (this.colorNow & 0xFF0000 ? 0x010000 : 0);
			this.colorNow = this.colorNow - (this.colorNow & 0x00FF00 ? 0x000100 : 0);
			this.colorNow = this.colorNow - (this.colorNow & 0x0000FF ? 0x000001 : 0);
			this.draw();
		}		
	}	
}

var items = {};
items['frame'] = new Frame();
items['indi'] = new indiIcon(gameParams, 120, 130, 40);
items['zone'] = new Text('ЗАВОД', textStyleZone, 920, 85, 'zone');
items['time'] = new Time(3600, textStyleTime, 80, 200, 'time');
items['buttonPasschar'] = new Button( 80, 500, 'buttonPasschar');
items['buttonPasstown'] = new Button(515, 500, 'buttonPasstown');
items['buttonGiveclue'] = new Button(950, 500, 'buttonGiveclue');

items['pass'] = new Time(0, textStylePass, 80, 500, 'pass', true);
items['buttonOk'] = new Button(80, 350, 'buttonOk');
items['buttonCancel'] = new Button(950, 350, 'buttonCancel');
items['arrow'] = new Arrow(620, 400, 'arrow');

for (item in items) {
	items['frame'].activate();
	items['indi'].activate();
	items['zone'].activate();
	items['time'].activate();
	items['buttonPasschar'].activate();
	items['buttonPasstown'].activate();
	items['buttonGiveclue'].activate();
}


function buttonTap(buttonName) {
	if (buttonName === 'buttonPasschar') {
		items['buttonPasschar'].deactivate();
		items['buttonPasstown'].deactivate();
		items['buttonGiveclue'].deactivate();
		items['pass'].activate();
		items['buttonOk'].activate();
		items['buttonCancel'].activate();
		items['arrow'].activate();
		items['pass'].setTime(0);
	}
	if (buttonName === 'buttonOk' || buttonName === 'buttonCancel') {
		if (buttonName === 'buttonOk') {
			qb.send('timebraslet-' + colorNames[items['arrow'].colorIndex], {type: 'timepass', time: items['pass'].time.raw});
		}
		items['buttonPasschar'].activate();
		items['buttonPasstown'].activate();
		items['buttonGiveclue'].activate();
		items['pass'].deactivate();
		items['buttonOk'].deactivate();
		items['buttonCancel'].deactivate();
		items['arrow'].deactivate();
	}	
}

app.ticker.add(function() {
	for (item in items) {
		items[item].animate();
	}
});

qb.on('ping', (data) => {
})
qb.on('connect', () => {
})
qb.on('disconnect', () => {
})

qb.on('receive', (msg) => {
	try {
		if (msg.payload ) {
			if (msg.payload.type === 'timepass') {
				items['time'].setTime(items['time'].time.raw + msg.payload.time);
			}
			if (msg.payload.type === 'json' && msg.payload.data && msg.payload.data.type === 'gadgettime') {
				items['time'].setTime(items['time'].time.raw + parseInt(msg.payload.data.value));
			}			
		} 
		
	}
	catch(error) {
	}
})

setInterval(() => {
	items['indi'].restoreColor();
	items['arrow'].restoreColor();
}, 1000 );

