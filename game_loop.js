window.onload = Initialize; //When we load the window, call the Initialize function

var canvas; //The primary canvas element (the space where things are rendered)
var context; //The primary context element (for drawing)
var hasBeenDragged; //Boolean representing if the window has been dragged (prevents auto-centering on window resize when true)

var keyStates; //Boolean array representing the state of the keyboard

var currentTime = 0;
var timeStep = 1000;
var renderInterval;

var bodyField;

var NumBodies = 10;
var MaxStartVelocity = 0.0003;
var MaxStartMass = 1;

//This function initializes all the game variables and starts the game loop.
function Initialize(){
	canvas = document.getElementById("mainCanvas")
	canvas.ondrag = CanvasDragEvent; //Drag event for the canvas
	context = canvas.getContext("2d");
	hasBeenDragged = false; //Canvas hasn't been dragged by default
	keyStates = new Array();
	
	//Canvas position is fixed and centered
	canvas.style.position = "fixed";
	canvas.style.top = (window.innerHeight-canvas.height)/2;
	canvas.style.left = (window.innerWidth-canvas.width)/2;
	
	renderInterval = 30;
	
	var bodies = new Array(NumBodies);
	for(var i = 0; i < NumBodies; i++)
		bodies[i] = new GBody(
			new Vector2(Math.random()*canvas.width,Math.random()*canvas.height),
			new Vector2((Math.random()*MaxStartVelocity*2)-MaxStartVelocity,(Math.random()*MaxStartVelocity*2)-MaxStartVelocity),
			Math.random()*(MaxStartMass-1)+1);
	
	
	bodies[0] = new GBody(new Vector2(300,300),new Vector2(0,0),15);
	//bodies[1] = new GBody(new Vector2(300,400),new Vector2(0.0005,0),0.05);
	bodyField = new GBodyField(bodies);
	
	InitiatlizeReportCanvas();
	
	GameLoop(); //Start the game!
	ReportCanvasLoop();
}

function Draw(){
	//Draw the background and border
	/*context.fillStyle = "#000000";
	context.fillRect(0,0,canvas.width,canvas.height);*/
	context.strokeStyle = "#FFFFFF";
	context.strokeRect(0,0,canvas.width,canvas.height);
	
	bodyField.render(context);
}

//The Update function takes a time step and updates the positions of the objects as well as the player.
function Update(dt){
	bodyField.update(dt);
	currentTime += dt;
	HandleKeyEvents(); //First handle any user input
}

//The time forward game loop function
function GameLoop(){
	Update(timeStep);
	Draw();
	setTimeout(GameLoop,renderInterval); //30ms is approximately 33 fps
}