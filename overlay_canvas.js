var overlayCanvas;
var overlayContext;
var previousTextArray;
var overlayCanvasLeftPadding = 2;
var overlayCanvasDisplayDecimalPlaces = 3;
var drawLabels = false; //Broken because of object blur

function InitializeOverlayCanvas(){
	overlayCanvas = document.getElementById("overlayCanvas");
	overlayContext = overlayCanvas.getContext("2d");
	
	overlayCanvas.style.position = "fixed";
	overlayCanvas.height = canvas.height;
	overlayCanvas.width = canvas.width;
	overlayCanvas.style.top = canvas.style.top;
	overlayCanvas.style.left = canvas.style.left;
	
	overlayCanvas.ondrag = CanvasDragEvent; //Drag event for the canvas
	
	previousTextArray = new Array(3);
	for(var i = 0; i < previousTextArray.length;i++)
		previousTextArray[i] = new Array(3);
		
	overlayCanvas.onmousedown = function(){overlayCanvas.focus();return false;};
}

function OverlayCanvasLoop(){
	if(!killScreenDisplayed){
		overlayContext.fillStyle = "#000000";
		for(var i = 0; i < previousTextArray.length;i++)
			overlayContext.fillText(previousTextArray[i][0],previousTextArray[i][1],previousTextArray[i][2]);
	
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
	setTimeout(OverlayCanvasLoop,renderInterval);
}