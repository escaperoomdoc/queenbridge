// init app
qb = new QueenBridge(location.host, {id: 'timebraslet-'+gameParams});
var app = new PIXI.Application(1280, 720, { transparent: true });
document.body.appendChild(app.view);

const loader = new PIXI.loaders.Loader();
loader.add('gill_sans_light', 'js/timebraslet/gill_sans_light.TTF');

loader.load((loader, resources) => {
	/*
	PointsTopText = new Text(
		 "P1:ADASDasdSD",
		 {fontFamily: 'gill_sans_light', fontSize: 32, fill: 'black'}
	);
	app.stage.addChild(PointsTopText);
	*/
	var aaa = 0;
});

// screen size is constant
const screenWidth = 1280;
const screenHeight = 720;

// create a new Sprite from an image path.
var Frame = function() {
	// init members
	this.bg = PIXI.Sprite.fromImage('js/timebraslet/bg.jpg');
	this.bg.anchor.set(0.5);
	this.bg.x = screenWidth / 2;
	this.bg.y = screenHeight / 2;
	this.activeSprites = false;
	this.stageCreate = function() {
		this.activeSprites = true;
		this.bg.hackerProperty = "frame";
		app.stage.addChild(this.bg);
	}
	this.stageClear = function() {
		this.activeSprites = false;
		for (var i = app.stage.children.length - 1; i >= 0; i--) {
			if (app.stage.children[i].hackerProperty === "frame") app.stage.removeChild(app.stage.children[i]);
		};	
	}
	// animate mask
	this.animate = function() {
	}
};

var textStyleTime = new PIXI.TextStyle({
	fontFamily: 'Candara',	//'Berlin Sans FB', 'Candara'
	fontSize: 128,
	fontStyle: 'normal',
	fontWeight: 'normal',
	fill: ['#28ff20']
});

var textStylePass = new PIXI.TextStyle({
	fontFamily: 'Candara',	//'Berlin Sans FB', 'Candara'
	fontSize: 128,
	fontStyle: 'normal',
	fontWeight: 'normal',
	fill: ['#ffff20']
});

var textTime = function(text) {
	// init members
	this.textSprite = new PIXI.Text(this.text, textStyleTime);
	this.textSprite.x = 200;
	this.textSprite.y = 240;
	// set new text
	this.setText = function(text) {
		this.text = text
		this.textSize = this.text.length;
		this.textSprite.text = text;
	}
	this.setText(text);
	this.activeSprites = false;
	// stageIn and stage Out
	this.stageCreate = function() {
		this.activeSprites = true;
		this.textSprite.hackerProperty = "time";
		app.stage.addChild(this.textSprite);
	}
	this.stageClear = function() {
		this.activeSprites = false;
		for (var i = app.stage.children.length - 1; i >= 0; i--) {
			if (app.stage.children[i].hackerProperty === "time") app.stage.removeChild(app.stage.children[i]);
		};	
	}
	this.animate = function() {
		this.textSprite._style._fill[0] = ['#28ff20'];
	}
};

var indiIcon = function(colorName, x, y, radius) {
	colors = {};
	colors['red'] = 0xFF0000;
	colors['green'] = 0x00FF00;
	colors['blue'] = 0x0000FF;
	colors['yellow'] = 0xFFFF00;
	colors['purple'] = 0xFF00FF;
	colors['cyan'] = 0x00FFFF;
	this.color = colors[colorName];
	this.colorNow = this.color;
	this.graphics = new PIXI.Graphics();
	this.graphics.lineStyle(0);
	this.graphics.beginFill(this.color, 1);
	this.graphics.drawCircle(x, y, radius);
	this.graphics.endFill();
	this.stageCreate = function() {
		this.activeSprites = true;
		this.graphics.hackerProperty = "indi";
		app.stage.addChild(this.graphics);
	}
	this.restoreColor = function() {
		this.colorNow = this.color;
	}
	this.animate = function() {
		this.colorNow = this.colorNow - (this.colorNow & 0xFF0000 ? 0x010000 : 0);
		this.colorNow = this.colorNow - (this.colorNow & 0x00FF00 ? 0x000100 : 0);
		this.colorNow = this.colorNow - (this.colorNow & 0x0000FF ? 0x000001 : 0);
		this.graphics.clear();
		this.graphics.lineStyle(0);
		this.graphics.beginFill(this.colorNow, 1);
		this.graphics.drawCircle(x, y, radius);
		this.graphics.endFill();
	}	
}


	/*
	var Codes = function(codesArray, fixTimes) {
		// init members
		this.codesArray = codesArray;
		this.fixTimes = fixTimes;
		this.textSprite = [];
		this.animationCycle = 0;
		this.currentCode = 0;
		this.counter = 0;
		this.scanFinished = false;
		for (var i = 0; i < codesArray.length; i ++) {
			var code = new PIXI.Text("", textStyle);
			code.x = 220 + 100 * i;
			code.y = 550;
			this.textSprite.push( code );
		}
		// set new text
		this.activeSprites = false;
		// stageIn and stage Out
		this.stageCreate = function() {
			this.activeSprites = true;
			for (item of this.textSprite) {
				item.hackerProperty = "code";
				app.stage.addChild(item);
			}
			this.currentCode = 0;
			this.tmprev = performance.now();
			this.tmstart = performance.now();
		}
		this.stageClear = function() {
			this.animationCycle = 0;
			this.currentCode = 0;
			this.counter = 0;
			this.scanFinished = false;
			this.activeSprites = false;
			for (item of this.textSprite) {
				item.text = "";
			}		
			for (var i = app.stage.children.length - 1; i >= 0; i--) {
				if (app.stage.children[i].hackerProperty === "code") app.stage.removeChild(app.stage.children[i]);
			};	
		}
		this.maxCounter = 0;
		this.animate = function() {
			var now = performance.now();
			if (this.activeSprites && this.currentCode < codesArray.length) {
				if (now - this.tmprev >= 200) {
					this.tmprev = now;
					this.textSprite[this.currentCode].text = Math.floor( Math.random() * 32 );
					if (now - this.tmstart >= this.fixTimes[this.currentCode]) {
						this.textSprite[this.currentCode].text = this.codesArray[this.currentCode];
						this.currentCode ++;
						if (this.currentCode >= codesArray.length) hackerStage.gotoFirewall();
					}
				}
			}
		}
	};

	var Stick = function() {
		// init members
		this.textureStick = PIXI.Texture.fromImage('assets/stick.png');
		this.stick = new PIXI.Sprite(this.textureStick);
		this.stick.anchor.set(0.5);
		this.stick.x = contentRect.x + contentRect.w / 2;
		this.stick.y = contentRect.y + contentRect.h / 2;
		this.activeSprites = false;
		// stageIn and stage Out
		this.stageCreate = function() {
			this.activeSprites = true;
			this.stick.hackerProperty = "stick";
			app.stage.addChild(this.stick);
			this.tmprev = performance.now();
		}
		this.stageClear = function() {
			this.activeSprites = false;
			for (var i = app.stage.children.length - 1; i >= 0; i--) {
				if (app.stage.children[i].hackerProperty === "stick") app.stage.removeChild(app.stage.children[i]);
			};	
		}
		// animate bricks and text
		this.animate = function() {
			var now = performance.now();
			if (this.activeSprites) {
				if (now - this.tmprev >= 100) {
					this.tmprev = now;
					this.stick.rotation += 0.05;
				}
			}
		}
	};

	var Firewall = function() {
		// init members
		this.textureBrick = PIXI.Texture.fromImage('assets/brick.png');
		this.textureBrickHacked = PIXI.Texture.fromImage('assets/brick_hacked.png');
		this.brickWidth = 160;
		this.brickHeight = 64;
		this.bricksCount = 5;
		this.bricks = [];
		this.texts = [];
		for (var y = 0; y < this.bricksCount; y ++ ) {
			for (var x = 0; x < this.bricksCount; x ++ ) {
				// generate brick
				const brick = new PIXI.Sprite(this.textureBrick);
				brick.anchor.set(0.5);
				brick.x = x * this.brickWidth + contentRect.x;
				brick.y = y * this.brickHeight + contentRect.y;
				if (y % 2) brick.x += this.brickWidth / 2;
				brick.interactive = true;
				brick.buttonMode = true;
				brick.animateRotation = false;
				brick.hacked = false;
				brick.on('pointerdown', onButtonDown);
				this.bricks.push(brick);
			}
			// generate text
			const text = new PIXI.Text('0', textStyle);
			text.x = this.brickWidth * this.bricksCount + contentRect.x + this.brickWidth / 2;
			text.y = y * this.brickHeight + contentRect.y;
			text.anchor.set(0.5);
			text.hackResult = 0;
			this.texts.push(text);
		}
		// tap/click handler
		function onButtonDown() {
			this.animateRotation = true;
		}	
		this.activeSprites = false;
		// stageIn and stage Out
		this.stageCreate = function() {
			this.activeSprites = true;
			for(brick of this.bricks) {
				brick.hackerProperty = "firewall";
				app.stage.addChild(brick);
			}
			for(text of this.texts) {
				text.hackerProperty = "firewall";
				app.stage.addChild(text);
			}
			this.tmprev = performance.now();
		}
		this.stageClear = function() {
			this.activeSprites = false;
			for(brick of this.bricks) {
				brick.hacked = false;
				brick.texture = this.textureBrick
			}		
			for(text of this.texts) {
				text.hackResult = 0;
				text.text = "0";
			}		
			for (var i = app.stage.children.length - 1; i >= 0; i--) {
				if (app.stage.children[i].hackerProperty === "firewall") app.stage.removeChild(app.stage.children[i]);
			};	
		}
		// animate bricks and text
		this.animate = function() {
			if (!this.activeSprites) return;
			var now = performance.now();
			if (now - this.tmprev < 50) return;
			this.tmprev = now;
			// animate bricks
			var updateText = false;
			for (index in this.bricks) {
				brick = this.bricks[index];
				textIndex = ~~(index/this.bricksCount);
				if (brick.animateRotation) {
					brick.rotation += 0.4;
					this.texts[textIndex].rotation += 0.4;
					if (brick.rotation >= 3.2) {
						brick.rotation = 0;
						this.texts[textIndex].rotation = 0;
						brick.animateRotation = false;
						brick.hacked = !brick.hacked;
						if (brick.hacked) brick.texture = this.textureBrickHacked;
						else brick.texture = this.textureBrick;
						updateText = true;
					}
				}
			}
			// render text
			var offset = 4;
			var result = 0;
			var textCount = 0;
			if (updateText) {
				for (brick of this.bricks) {
					if (brick.hacked) {
						result |= (1<<offset);
					}
					offset --;
					if (offset < 0) {
						this.texts[textCount].hackResult = result;
						this.texts[textCount].text = result.toString();
						offset = 4;
						result = 0;
						textCount ++;
					}
				}
			}
			if (this.checkSolution()) {
				hackerStage.gotoAccess();
			}
		}
		// animate bricks and text
		this.checkSolution = function() {
			try {
				for (var i = 0; i < this.bricksCount; i ++) {
					if (this.texts[i].hackResult !== codes.codesArray[i]) return false;
				}
				return true;
			}
			catch(error) {
				return false;
			}
		}
	};

	var Video = function(videoFileName, loop) {
		// init members
		this.videoFileName = videoFileName;
		this.texture = PIXI.Texture.fromVideo(this.videoFileName);
		this.texture.baseTexture.source.loop = loop;
		this.texture.baseTexture.source.autoplay = false;
		this.videoSprite = new PIXI.Sprite(this.texture);
		this.videoSprite.x = 130;
		this.videoSprite.y = 113;
		this.videoSprite.width = 1027;
		this.videoSprite.height = 488;
		this.videoSprite.alfa = 0.5;
		this.activeSprites = false;
		this.texture.baseTexture.source.pause();
		// stageIn and stage Out
		this.stageCreate = function() {
			this.activeSprites = true;
			this.videoSprite.hackerProperty = this.videoFileName;
			app.stage.addChild(this.videoSprite);
			this.texture.baseTexture.source.currentTime = 0;
			this.texture.baseTexture.source.play();
		}
		this.stageClear = function() {
			this.texture.baseTexture.source.pause();
			this.activeSprites = false;
			for (var i = app.stage.children.length - 1; i >= 0; i--) {
				if (app.stage.children[i].hackerProperty === this.videoFileName) app.stage.removeChild(app.stage.children[i]);
			}
		}
		this.texture.baseTexture.source.onplay = () => {
			if(!this.activeSprites) this.texture.baseTexture.source.pause();
		}
		this.animate = function() {
			var aaa = 0;
		}
	};
	*/
	
	// construction
	frame = new Frame();
	time = new textTime('2568∙12∙25 13∙45∙06');
	pass = new textTime('0000∙00∙00 00∙00∙00');
	indi = new indiIcon(gameParams, 80, 320, 50);
	
	/*
	stick = new Stick();
	securityVideo = new Video('assets/security.mp4', true);
	firewall = new Firewall();
	codes = new Codes([13, 10, 25, 14, 31], [5600, 10400, 15500, 20500, 25500]);
	attackVideo = new Video('assets/attack.mp4', true);
	videoIntro = new Video('assets/[eng]intro.mp4', false);
	videoPower = new Video('assets/[eng]power.mp4', false);
	*/
	// frame is always on
	frame.stageCreate();
	time.stageCreate();
	indi.stageCreate();

	// timer event
	app.ticker.add(function() {
		frame.animate();
		time.animate();
		indi.animate();
		/*
		stick.animate();
		firewall.animate();
		codes.animate();
		securityVideo.animate();
		attackVideo.animate();	
		*/
	});
/*
}
*/

qb.on('ping', (data) => {
	indi.restoreColor();
})

qb.on('receive', (data) => {
	try {
		for (msg of data.msgs) {
		}
	}
	catch(error) {
	}
})

function onCommand(socket, text) {
	/*
	hackerStage.socket = socket;
	if (text === "gotoDisabled") hackerStage.gotoDisabled(); else
	if (text === "gotoStick") hackerStage.gotoStick(); else
	if (text === "gotoScan") hackerStage.gotoScan(); else
	if (text === "gotoFirewall") hackerStage.gotoFirewall(); else
	if (text === "gotoAccess") hackerStage.gotoAccess(); else
	if (text === "gotoAttack") hackerStage.gotoAttack(); else
	if (text === "gotoVideoIntro") hackerStage.gotoVideoIntro(); else
	if (text === "gotoVideoPower") hackerStage.gotoVideoPower(); else
	console.log("error, unknown goto command : text");
	*/
}
