var reportCanvas;
var reportContext;
var positionWidth = 3;
var velocityWidth = 7;
var reportCanvasRenderInterval = 30;
var reportCanvasLeftPadding = 4;
function InitializeReportCanvas(){
	reportCanvas = document.getElementById("reportCanvas");
	reportContext = reportCanvas.getContext("2d");
	reportCanvas.style.position = "fixed";
	if(!hasBeenDragged){
		reportCanvas.height = bodyField.bodies.length*textSpacing+2*textSpacing+reportCanvasLeftPadding;
		reportCanvas.style.top = (window.innerHeight-reportCanvas.height)/2;
		reportCanvas.style.left = parseInt(canvas.style.left,textSpacing)-reportCanvas.width-textSpacing;
	}
	reportCanvas.ondrag = CanvasDragEvent; //Drag event for the canvas
}

function ReportCanvasLoop(){
	reportContext.fillStyle = "#000000";
	reportContext.fillRect(0,0,reportCanvas.width,reportCanvas.height);
	reportContext.strokeStyle = "#FFFFFF";
	reportContext.strokeRect(0,0,reportCanvas.width,reportCanvas.height);
	reportContext.fillStyle = "#FFFFFF";
	reportContext.fillText("Current Time: " + currentTime + ", Time Step: " + timeStep,reportCanvasLeftPadding,textSpacing);
	var yPos = 2*textSpacing;
	for(var i = 0; i < bodyField.bodies.length&&yPos+textSpacing<reportCanvas.height;i++){
		reportContext.fillText(i+" - X: " + bodyField.bodies[i].pos.x.toFixed(positionWidth) + ",Y: " + bodyField.bodies[i].pos.y.toFixed(positionWidth) + ",XVel: " + bodyField.bodies[i].vel.x.toFixed(velocityWidth) + ",YVel: " + bodyField.bodies[i].vel.y.toFixed(velocityWidth),reportCanvasLeftPadding,yPos);
		yPos+=textSpacing;
	}
	reportContext.fillText("P - X: " + pc.pos.x.toFixed(positionWidth) + ",Y: " + pc.pos.y.toFixed(positionWidth) + ",XVel: " + pc.vel.x.toFixed(velocityWidth) + ",YVel: " + pc.vel.y.toFixed(velocityWidth),reportCanvasLeftPadding,yPos);
	setTimeout(ReportCanvasLoop,reportCanvasRenderInterval);
}