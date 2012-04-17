//NOTE: Canvas size is not dynamically determined. If more objects 
//are added, the canvas height will need to be increase

//Report canvas and context for drawing
var reportCanvas;
var reportContext;

//Determines how fast we update/redraw
var reportCanvasRenderInterval;

//Text properties
var positionWidth; //Width in digits of position information
var velocityWidth; //Width in digits of velocity information
var reportCanvasLeftPadding; //Padding on the left of the box

function InitializeReportCanvas(){
	//Approximate 33 fps
	reportCanvasRenderInterval = 30;
	
	//Position to 3 digits, velocity to 7 digits
	positionWidth = 3;
	velocityWidth = 7;
	reportCanvasLeftPadding = 4;
	
	//Get canvas and context
	reportCanvas = document.getElementById("reportCanvas");
	reportContext = reportCanvas.getContext("2d");
	
	//Fixed position, look out for if anything has been dragged and set variables accordingly
	reportCanvas.style.position = "fixed";
	if(!hasBeenDragged){
		reportCanvas.height = bodyField.bodies.length*textSpacing+2*textSpacing+reportCanvasLeftPadding;
		reportCanvas.style.top = (window.innerHeight-reportCanvas.height)/2;
		reportCanvas.style.left = parseInt(canvas.style.left,10)-reportCanvas.width-textSpacing;
	}
	
	reportCanvas.ondrag = CanvasDragEvent; //Drag event for the canvas
	
	//Apply focus if clicked
	reportCanvas.onmousedown = function(){reportCanvas.focus();return false;};
	
	//Start looping
	ReportCanvasLoop();
}

function ReportCanvasLoop(){
	//Fill background and draw border
	reportContext.fillStyle = "#000000";
	reportContext.fillRect(0,0,reportCanvas.width,reportCanvas.height);
	reportContext.strokeStyle = "#FFFFFF";
	reportContext.strokeRect(0,0,reportCanvas.width,reportCanvas.height);
	
	//Write time and time step
	reportContext.fillStyle = "#FFFFFF";
	reportContext.fillText("Current Time: " + currentTime + ", Time Step: " + timeStep,reportCanvasLeftPadding,textSpacing);
	
	//Write all lines of object data
	var yPos = 2*textSpacing;
	for(var i = 0; i < bodyField.bodies.length&&yPos+textSpacing<reportCanvas.height;i++){
		reportContext.fillText(i+" - X: " + bodyField.bodies[i].pos.x.toFixed(positionWidth) + ",Y: " + bodyField.bodies[i].pos.y.toFixed(positionWidth) + ",XVel: " + bodyField.bodies[i].vel.x.toFixed(velocityWidth) + ",YVel: " + bodyField.bodies[i].vel.y.toFixed(velocityWidth),reportCanvasLeftPadding,yPos);
		yPos+=textSpacing;
	}
	//Write player information
	reportContext.fillText("P - X: " + pc.pos.x.toFixed(positionWidth) + ",Y: " + pc.pos.y.toFixed(positionWidth) + ",XVel: " + pc.vel.x.toFixed(velocityWidth) + ",YVel: " + pc.vel.y.toFixed(velocityWidth),reportCanvasLeftPadding,yPos);
	
	//Loop!
	setTimeout(ReportCanvasLoop,reportCanvasRenderInterval);
}