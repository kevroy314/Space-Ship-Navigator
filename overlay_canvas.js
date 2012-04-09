var overlayCanvas;
var overlayContext;
var previousTextArray = new Array(3);
function InitializeOverlayCanvas(){
	overlayCanvas = document.getElementById("overlayCanvas");
	overlayContext = overlayCanvas.getContext("2d");
	overlayCanvas.style.position = "fixed";
	overlayCanvas.height = canvas.height;
	overlayCanvas.width = canvas.width;
	overlayCanvas.style.top = canvas.style.top;
	overlayCanvas.style.left = canvas.style.left;
	overlayCanvas.ondrag = CanvasDragEvent; //Drag event for the canvas
	for(var i = 0; i < previousTextArray.length;i++)
		previousTextArray[i] = new Array(3);
}

function OverlayCanvasLoop(){
	if(!killScreenDisplayed){
		overlayContext.fillStyle = "#000000";
		for(var i = 0; i < previousTextArray.length;i++)
			overlayContext.fillText(previousTextArray[i][0],previousTextArray[i][1],previousTextArray[i][2]);
	
		overlayContext.fillStyle = "#FF0000";
		overlayContext.fillText("Time: " + elapsedTime,2,10);
		previousTextArray[0] = new Array("Time: " + elapsedTime,2,10);
		overlayContext.fillText("Best: " + pc.bestDistToGoal.toFixed(3),2,20);
		previousTextArray[1] = new Array("Best: " + pc.bestDistToGoal.toFixed(3),2,20);
		overlayContext.fillText("Fuel: " + pc.fuel,2,30);
		previousTextArray[2] = new Array("Fuel: " + pc.fuel,2,30);
	}
	setTimeout(OverlayCanvasLoop,renderInterval);
}