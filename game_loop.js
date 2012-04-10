window.onload = Initialize;

var outputDivArea;
var inputDivArea;

var canvas;
var context;
var hasBeenDragged;

var keyStates;

var currentTime = 0;
var timeStep = 500;
var renderInterval = 15;
var decimalsToPrint = 2;
var randomStartDecimalAccuracy = 2;
var startFuel = 100;
var boundryPadding = 10;
var resetFadeSpeed = 0.3; //Higher means faster fade
var gameStateTextColor = "#FF0000";
var bodyField;
var pc;
var newGameInstructionFadeTime = 100;
var textSpacing = 10;
var winDistance = 10.000000;
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
		fadeDegree = resetFadeSpeed;
		restartFlag = false;
	}
	else{
		hasBeenDragged = false;
		
		canvas.style.position = "fixed";
		canvas.style.top = (window.innerHeight-canvas.height)/2;
		canvas.style.left = (window.innerWidth-canvas.width)/2;
	}
	
	if(newLevelFlag){
		var start = new Vector2(getRandomRoundedInRange(boundryPadding,canvas.width-boundryPadding,randomStartDecimalAccuracy),getRandomRoundedInRange(boundryPadding,canvas.height-boundryPadding,randomStartDecimalAccuracy));
		var goal = new Vector2(getRandomRoundedInRange(boundryPadding,canvas.width-boundryPadding,randomStartDecimalAccuracy),getRandomRoundedInRange(boundryPadding,canvas.height-boundryPadding,randomStartDecimalAccuracy));
		var requiredDistance = Math.sqrt(canvas.width*canvas.width+canvas.height*canvas.height)/3;
	
		while(Math.sqrt((start.x-goal.x)*(start.x-goal.x)+(start.y-goal.y)*(start.y-goal.y))<requiredDistance)
			goal = new Vector2(getRandomRoundedInRange(boundryPadding,canvas.width-boundryPadding,randomStartDecimalAccuracy),getRandomRoundedInRange(boundryPadding,canvas.height-boundryPadding,randomStartDecimalAccuracy));
		
		pc = new PlayerCharacter(start,startFuel,goal);
		pcClone = new PlayerCharacter(start,startFuel,goal);
		levelStartState[0] = pcClone;
		
		//CURRENTLY CUSTOM
		var bodies = new Array(NumBodies);
		for(var i = 0; i < NumBodies/2; i++)
			bodies[i] = new GBody(
				new Vector2(getRandomRoundedInRange(0,canvas.width,randomStartDecimalAccuracy),getRandomRoundedInRange(0,canvas.height,randomStartDecimalAccuracy)),
				new Vector2(getRandomRoundedInRange(0,MaxStartVelocity,randomStartDecimalAccuracy),getRandomRoundedInRange(0,MaxStartVelocity,randomStartDecimalAccuracy)),
				getRandomRoundedInRange(1,MaxStartMass,randomStartDecimalAccuracy));
		for(var i = NumBodies/2; i < NumBodies; i++)
			bodies[i] = new GBody(
				new Vector2(getRandomRoundedInRange(0,canvas.width,randomStartDecimalAccuracy),getRandomRoundedInRange(0,canvas.height,randomStartDecimalAccuracy)),
				new Vector2(getRandomRoundedInRange(0,MaxStartVelocity,randomStartDecimalAccuracy),getRandomRoundedInRange(0,MaxStartVelocity,randomStartDecimalAccuracy)),
				getRandomRoundedInRange(1,MaxStartMass/100,randomStartDecimalAccuracy));
		bodies[0] = new GBody(new Vector2(150,150),new Vector2(0,0),100000);
		//END CURRENTLY CUSTOM
	
	
		bodyField = new GBodyField(bodies);
		var clonedBodyArray = new Array(bodies.length);
		for(var i = 0; i < clonedBodyArray.length;i++)
			clonedBodyArray[i] = new GBody(new Vector2(bodies[i].pos.x,bodies[i].pos.y),new Vector2(bodies[i].vel.x,bodies[i].vel.y),bodies[i].m);
		var clonedBodyField = new GBodyField(clonedBodyArray);
		levelStartState[1] = clonedBodyField;
	}
	else{
		pc = new PlayerCharacter(levelStartState[0].startPos,startFuel,levelStartState[0].goalPos);
		var clonedBodyArray = new Array(levelStartState[1].bodies.length);
		for(var i = 0; i < clonedBodyArray.length;i++)
			clonedBodyArray[i] = new GBody(new Vector2(levelStartState[1].bodies[i].pos.x,levelStartState[1].bodies[i].pos.y),new Vector2(levelStartState[1].bodies[i].vel.x,levelStartState[1].bodies[i].vel.y),levelStartState[1].bodies[i].m);
		var clonedBodyField = new GBodyField(clonedBodyArray);
		bodyField = clonedBodyField;
	}
	
	InitializeOverlayCanvas();
	InitializeReportCanvas();
	
	context.fillStyle = gameStateTextColor;
	context.fillText("Press R to Restart",canvas.width/3,canvas.height/3);
	context.fillText("Press N to Play New Level",canvas.width/3,canvas.height/3+textSpacing);
	
	outputDivArea = document.getElementById("initialParams");
	outputDivArea.style.top = canvas.style.top;
	outputDivArea.style.left = parseInt(canvas.style.left,10)+canvas.width;
	var simulationString = "<div class=\"initial-params-div-header\">----Simulation----</div>Time Step: "+timeStep+"</br>Num Bodies: "+NumBodies+"</br>G: "+G+"</br>G Dist Threshold: 2"+gravityDistanceThreshold+"</br>Note: The G Dist Threshold is the distance under which gravity is ignored to prevent singularities.</br>";
	var shipString = "<div class=\"initial-params-div-header\">----Ship----</div>P(x,y): ("+pc.pos.x.toFixed(2)+","+pc.pos.y.toFixed(2)+")</br>V(x,y): ("+pc.vel.x.toFixed(2)+","+pc.vel.y.toFixed(2)+")</br>Mass: "+pc.mass+"</br>Start Fuel: "+pc.fuelCapacity+"</br>";
	var goalString = "<div class=\"initial-params-div-header\">----Goal----</div>P(x,y): ("+pc.goalPos.x+","+pc.goalPos.y+")</br>";
	var objectsString = "<div class=\"initial-params-div-header\">----Objects----</div>";
	for(var i = 0; i < bodyField.bodies.length;i++){
		objectsString += "Number: "+i+"</br>Pos(x,y): ("+bodyField.bodies[i].pos.x+","+bodyField.bodies[i].pos.y+")</br>Vel(x,y): ("+bodyField.bodies[i].vel.x+","+bodyField.bodies[i].vel.y+")</br>Mass: "+bodyField.bodies[i].m+"</br></br>";
	}
	outputDivArea.innerHTML = simulationString+shipString+goalString+objectsString;
	
	inputDivArea = document.getElementById("inputInstructions");
	inputDivArea.style.top = parseInt(canvas.style.top,10)+canvas.height;
	inputDivArea.style.left = canvas.style.left;
	//inputDivArea.onmousedown = function(){outputDivArea.style.top=parseInt(canvas.style.top,10)+canvas.height;inputDivArea.onmousedown=null;return true;};

	GameLoop();
	OverlayCanvasLoop();
	ReportCanvasLoop();
}

function getRandomRoundedInRange(min,max,roundToDec){
	return parseFloat(((Math.random()*(max-min))+min).toFixed(roundToDec),10);
}

function Draw(){
	context.fillStyle = "rgba(0,0,0,"+fadeDegree+")";
	context.fillRect(0,0,canvas.width,canvas.height);
	context.strokeStyle = "#FFFFFF";
	context.strokeRect(0,0,canvas.width,canvas.height);
	
	bodyField.render(context);
	pc.render(context);
	
	if(instructionDrawTimer<newGameInstructionFadeTime){
		context.fillStyle = gameStateTextColor;
		context.fillText("Press R to Restart",canvas.width/3,canvas.height/3);
		context.fillText("Press N to Play New Level",canvas.width/3,canvas.height/3+textSpacing);
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
	outputDivArea.style.top = canvas.style.top;
	outputDivArea.style.left = parseInt(canvas.style.left,10)+canvas.width;
	inputDivArea.style.top = parseInt(canvas.style.top,10)+canvas.height;
	inputDivArea.style.left = canvas.style.left;
	if(fadeDegree>1/tailLength) fadeDegree-=(1/newGameInstructionFadeTime);
	else fadeDegree=1/tailLength;
	Update(timeStep);
	Draw();	
	if(pc.bestDistToGoal<winDistance){
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
	
	context.fillStyle = gameStateTextColor;
	context.fillText("Great Work!",canvas.width/2,canvas.height/2);
	context.fillText("Time: " + elapsedTime,canvas.width/2,canvas.height/2+textSpacing);
	context.fillText("Fuel Remaining: " + pc.fuel,canvas.width/2,canvas.height/2+textSpacing*2);
	context.fillText("Press R to Replay",canvas.width/2,canvas.height/2+textSpacing*3);
	context.fillText("Press N to Play New Level",canvas.width/2,canvas.height/2+textSpacing*4);
}

function UpdateKillScreen(){
	//Make sure the canvas' are NSYNC
	canvas.style.top = overlayCanvas.style.top;
	canvas.style.left = overlayCanvas.style.left;
	outputDivArea.style.top = canvas.style.top;
	outputDivArea.style.left = parseInt(canvas.style.left,10)+canvas.width;
	inputDivArea.style.top = parseInt(canvas.style.top,10)+canvas.height;
	inputDivArea.style.left = canvas.style.left;
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

function executeButtonClick(){
	alert("HEY!");
}