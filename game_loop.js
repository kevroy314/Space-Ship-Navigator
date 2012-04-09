window.onload = Initialize;

var divArea;

var canvas;
var context;
var hasBeenDragged;

var keyStates;

var currentTime = 0;
var timeStep = 500;
var renderInterval = 15;

var bodyField;
var pc;

var restartFlag = false;
var newLevelFlag = true;
var levelStartState = new Array(2);
var killScreenDisplayed = false;
var NumBodies = 10;
var MaxStartVelocity = 0.0003;
var MaxStartMass = 10000;
var tailLength = 25;
var fadeDegree = 1/tailLength;
var elapsedTime;
var instructionDrawTimer;

function Initialize(){
	instructionDrawTimer = 0;
	canvas = document.getElementById("mainCanvas")
	canvas.ondrag = CanvasDragEvent;
	context = canvas.getContext("2d");
	keyStates = new Array();
	killScreenDisplayed = false;
	elapsedTime = 0;
	
	if(restartFlag){
		fadeDegree = 0.3;
		restartFlag = false;
	}
	else{
		hasBeenDragged = false;
		
		canvas.style.position = "fixed";
		canvas.style.top = (window.innerHeight-canvas.height)/2;
		canvas.style.left = (window.innerWidth-canvas.width)/2;
	}
	
	if(newLevelFlag){
		var start = new Vector2(Math.random()*(canvas.width-20)+10,Math.random()*(canvas.height-20)+10);
		var goal = new Vector2(Math.random()*(canvas.width-20)+10,Math.random()*(canvas.height-20)+10);
		var requiredDistance = Math.sqrt(canvas.width*canvas.width+canvas.height*canvas.height)/3;
	
		while(Math.sqrt((start.x-goal.x)*(start.x-goal.x)+(start.y-goal.y)*(start.y-goal.y))<requiredDistance)
			goal = new Vector2(Math.random()*(canvas.width-20)+10,Math.random(canvas.height-20)+10);
		
		pc = new PlayerCharacter(start,100,goal);
		pcClone = new PlayerCharacter(start,100,goal);
		levelStartState[0] = pcClone;
		
		var bodies = new Array(NumBodies);
		for(var i = 0; i < NumBodies/2; i++)
			bodies[i] = new GBody(
				new Vector2(Math.random()*canvas.width,Math.random()*canvas.height),
				new Vector2((Math.random()*MaxStartVelocity*2)-MaxStartVelocity,(Math.random()*MaxStartVelocity*2)-MaxStartVelocity),
				Math.random()*(MaxStartMass-1)+1);
		for(var i = NumBodies/2; i < NumBodies; i++)
			bodies[i] = new GBody(
				new Vector2(Math.random()*canvas.width,Math.random()*canvas.height),
				new Vector2((Math.random()*MaxStartVelocity*2)-MaxStartVelocity,(Math.random()*MaxStartVelocity*2)-MaxStartVelocity),
				Math.random()*(MaxStartMass/100-1)+1);
		bodies[0] = new GBody(new Vector2(150,150),new Vector2(0,0),100000);
	
		bodyField = new GBodyField(bodies);
		var clonedBodyArray = new Array(bodies.length);
		for(var i = 0; i < clonedBodyArray.length;i++)
			clonedBodyArray[i] = new GBody(new Vector2(bodies[i].pos.x,bodies[i].pos.y),new Vector2(bodies[i].vel.x,bodies[i].vel.y),bodies[i].m);
		var clonedBodyField = new GBodyField(clonedBodyArray);
		levelStartState[1] = clonedBodyField;
	}
	else{
		pc = new PlayerCharacter(levelStartState[0].startPos,100,levelStartState[0].goalPos);
		var clonedBodyArray = new Array(levelStartState[1].bodies.length);
		for(var i = 0; i < clonedBodyArray.length;i++)
			clonedBodyArray[i] = new GBody(new Vector2(levelStartState[1].bodies[i].pos.x,levelStartState[1].bodies[i].pos.y),new Vector2(levelStartState[1].bodies[i].vel.x,levelStartState[1].bodies[i].vel.y),levelStartState[1].bodies[i].m);
		var clonedBodyField = new GBodyField(clonedBodyArray);
		bodyField = clonedBodyField;
	}
	
	InitializeOverlayCanvas();
	InitializeReportCanvas();
	
	context.fillStyle = "#FF0000";
	context.fillText("Press R to Restart",canvas.width/3,canvas.height/3);
	context.fillText("Press N to Play New Level",canvas.width/3,canvas.height/3+10);
	
	divArea = document.getElementById("initialParams");
	divArea.style.top = canvas.style.top;
	divArea.style.left = parseInt(canvas.style.left,10)+canvas.width;
	divArea.innerHTML = "<div style='text-align: center'>----Ship----</div>P(x,y): ("+pc.pos.x.toFixed(2)+","+pc.pos.y.toFixed(2)+")</br>V(x,y): ("+pc.vel.x.toFixed(2)+","+pc.vel.y.toFixed(2)+")</br>Mass: "+pc.mass+"</br>Start Fuel: "+pc.fuelCapacity+"</br>";
	
	GameLoop();
	OverlayCanvasLoop();
	ReportCanvasLoop();
}

//var previousBestString = "";
//var previousFuelString = "";
//var previousElapsedTimeString = "";

function Draw(){
	context.fillStyle = "rgba(0,0,0,"+fadeDegree+")";
	context.fillRect(0,0,canvas.width,canvas.height);
	context.strokeStyle = "#FFFFFF";
	context.strokeRect(0,0,canvas.width,canvas.height);
	
	bodyField.render(context);
	pc.render(context);
	
	if(instructionDrawTimer<100){
		context.fillStyle = "#FF0000";
		context.fillText("Press R to Restart",canvas.width/3,canvas.height/3);
		context.fillText("Press N to Play New Level",canvas.width/3,canvas.height/3+10);
		instructionDrawTimer++;
	}
}

function Update(dt){
	elapsedTime +=dt;
	bodyField.update(dt);
	pc.update(bodyField.bodies,dt);
	currentTime += dt;
	HandleKeyEvents();
}

function GameLoop(){
	//Make sure the canvas' are NSYNC
	canvas.style.top = overlayCanvas.style.top;
	canvas.style.left = overlayCanvas.style.left;
	divArea.style.top = canvas.style.top;
	divArea.style.left = parseInt(canvas.style.left,10)+canvas.width;
	if(fadeDegree>1/tailLength) fadeDegree-=0.01;
	else fadeDegree=1/tailLength;
	Update(timeStep);
	Draw();	
	if(pc.bestDistToGoal<10.00000){
		killScreenDisplayed = true;
		setTimeout(KillScreenLoop,renderInterval);
	}
	else if(restartFlag==true)
		Initialize();
	else
		setTimeout(GameLoop,renderInterval);
	
}

function DrawKillScreen(){
	context.fillStyle = "#000000";
	context.fillRect(0,0,canvas.width,canvas.height);
	context.strokeStyle = "#FFFFFF";
	context.strokeRect(0,0,canvas.width,canvas.height);
	
	context.fillStyle = "#FF0000";
	context.fillText("Great Work!",canvas.width/2,canvas.height/2);
	context.fillText("Time: " + elapsedTime,canvas.width/2,canvas.height/2+10);
	context.fillText("Fuel Remaining: " + pc.fuel,canvas.width/2,canvas.height/2+20);
	context.fillText("Press R to Replay",canvas.width/2,canvas.height/2+30);
	context.fillText("Press N to Play New Level",canvas.width/2,canvas.height/2+40);
}

function UpdateKillScreen(){
	//Make sure the canvas' are NSYNC
	canvas.style.top = overlayCanvas.style.top;
	canvas.style.left = overlayCanvas.style.left;
	divArea.style.top = canvas.style.top;
	divArea.style.left = parseInt(canvas.style.left,10)+canvas.width;
	if(keyStates[82]){ //R Key
		restartFlag = true;
		newLevelFlag = false;
	}
	if(keyStates[78]){ //N Key
		newLevelFlag = true;
		restartFlag = true;
	}
}

function KillScreenLoop(){
	DrawKillScreen();
	UpdateKillScreen();
	if(restartFlag)
		Initialize();
	else
		setTimeout(KillScreenLoop,renderInterval);
}