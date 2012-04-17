//Context and canvas for drawing
var overlayCanvas;
var overlayContext;

//How often we redraw
var overlayRenderInteval;

//Flag for if the overlay loop is running
var overlayRunning;

//Previous text drawn (so it can be erased)
var previousTextArray;

//Text formatting information
var overlayCanvasLeftPadding;
var overlayCanvasDisplayDecimalPlaces;

//Draws labels on objects
var drawLabels; //Broken because of object blur

function InitializeOverlayCanvas(dependentCanvas){
	//Approximately 33fps
	overlayRenderInterval = 30;
	
	//Set text variables
	overlayCanvasLeftPadding = 2;
	overlayCanvasDisplayDecimalPlaces = 3;
	
	//Don't use draw labels because it will not work. Left the code in in case of later modification
	drawLabels = false; //Broken because of object blur
	
	//Initialize the canvas and context for drawing
	overlayCanvas = document.getElementById("overlayCanvas");
	overlayContext = overlayCanvas.getContext("2d");
	
	//Set the style to fixed, and set position and size to the same as the canvas
	overlayCanvas.style.position = "fixed";
	overlayCanvas.height = dependentCanvas.height;
	overlayCanvas.width = dependentCanvas.width;
	overlayCanvas.style.top = dependentCanvas.style.top;
	overlayCanvas.style.left = dependentCanvas.style.left;
	
	overlayCanvas.ondrag = CanvasDragEvent; //Drag event for the canvas
	
	//Initialize the previous text array to empty
	previousTextArray = new Array(3);
	for(var i = 0; i < previousTextArray.length;i++)
		previousTextArray[i] = new Array(3);
		
	//Apply focus if clicked
	overlayCanvas.onmousedown = function(){overlayCanvas.focus();return false;};
	
	//Set our flag to running
	overlayRunning = true;
	
	//Loop!
	OverlayCanvasLoop();
}

function OverlayCanvasLoop(){
	if(overlayRunning){
		//Erase old text
		overlayContext.fillStyle = "#000000";
		for(var i = 0; i < previousTextArray.length;i++)
			overlayContext.fillText(previousTextArray[i][0],previousTextArray[i][1],previousTextArray[i][2]);
	
		//Draw new text
		var verticalPos = boundryPadding;
		overlayContext.fillStyle = gameStateTextColor;
		overlayContext.fillText("Time: " + elapsedTime,overlayCanvasLeftPadding,verticalPos);
		previousTextArray[0] = new Array("Time: " + elapsedTime,overlayCanvasLeftPadding,boundryPadding);
		verticalPos+=boundryPadding;
		overlayContext.fillText("Best: " + pc.bestDistToGoal.toFixed(overlayCanvasDisplayDecimalPlaces),overlayCanvasLeftPadding,verticalPos);
		previousTextArray[1] = new Array("Best: " + pc.bestDistToGoal.toFixed(overlayCanvasDisplayDecimalPlaces),overlayCanvasLeftPadding,verticalPos);
		verticalPos+=boundryPadding;
		overlayContext.fillText("Fuel: " + pc.fuel,overlayCanvasLeftPadding,verticalPos);
		previousTextArray[2] = new Array("Fuel: " + pc.fuel,overlayCanvasLeftPadding,verticalPos);
	}
	
	//Loop!
	setTimeout(OverlayCanvasLoop,overlayRenderInteval);
}