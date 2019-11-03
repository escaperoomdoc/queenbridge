qb = new QueenBridge(location.host, {id: name, autoping: null});
var app = new PIXI.Application(1920, 1080, { transparent: true });
document.body.appendChild(app.view);

// text style is constant
var tsHead = new PIXI.TextStyle({
	fontFamily: 'Lucidia Console',
	fontSize: 48,
	fontStyle: 'normal',
	fontWeight: 'normal',
	fill: ['#000000'],
	wordWrap: false,
	wordWrapWidth: 275
});

var InfoText = function(initialText, textStyle, x, y) {
	// init members
	this.text = initialText;
	this.textSprite = new PIXI.Text(this.text, textStyle);
	this.textSprite.x = x;
	this.textSprite.y = y;
	this.textDelay = 200;
	app.stage.addChild(this.textSprite);
	// set new text
	this.setText = function(text) {
		this.textSprite.text = text;
	}
};

cycleInfo = new InfoText("Count = ", tsHead, 10, 10);
cycleValue = new InfoText("-", tsHead, 200, 10);
statsInfo = new InfoText("Stats = ", tsHead, 10, 70);
statsValue = new InfoText("-", tsHead, 200, 70);
distInfo = [];
distValue = [];
for (var i=0; i<10; i++) {
	distInfo.push(new InfoText(`${i*100}-${(i+1)*100} ms:`, tsHead, 10, 150 + i * 60))
	distValue.push(new InfoText("0 (0%)", tsHead, 350, 150 + i * 60))
	distValue[i].pingCount = 0;
}

var pingCount = 0;
var pingRecv = false;
var pingMs = 0;
var pingStart = 0;

var statOk = 0;
var statError = 0;
var statOut = 0;

function showCount() {
	if (pingRecv) {
		cycleValue.setText(pingCount.toString() + ` (last ${pingMs} ms)`);
	}
	else {
		cycleValue.setText(pingCount);
	}	
}

function showStat() {
	statsValue.setText(`OK - ${statOk}(${Math.floor(statOk/pingCount*1000)/10}%), OUT - ${statOut}(${Math.floor(statOut/pingCount*1000)/10}%)`)
}

function showDist() {
	for (var i = 0; i < 10; i++) {
		distValue[i].setText(`${distValue[i].pingCount} (${Math.floor(distValue[i].pingCount/statOk*1000)/10}%)`);
	}
}

qb.on('ping', function(data) {
	var pingBack = data.id;
	if (pingBack === pingCount) {
		var pingEnd = Date.now();
		pingMs = pingEnd - pingStart;
		if (pingMs >= 0 && pingMs < 1000) {
			pingRecv = true;
			statOk ++;
			showStat();
			var index = Math.floor(pingMs / 100);
			distValue[index].pingCount ++;
			showDist();
		}
		else {
			statOut ++;
			showStat();
		}
	}
	else {
		statOut ++;
		showStat();
	}
});

app.ticker.stop();
setInterval( () => {
	if (pingCount > 0) showStat();
	pingCount ++;
	showCount();
	pingRecv = false;
	pingStart = Date.now();
	qb.ping(pingCount);
	app.renderer.render(app.stage);
}, 1000)



