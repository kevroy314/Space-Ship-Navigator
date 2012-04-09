var reportCanvas;
var reportContext;
var numberWidth = 3;
function InitiatlizeReportCanvas(){
	reportCanvas = document.getElementById("reportCanvas");
	reportContext = reportCanvas.getContext("2d");
	reportCanvas.style.position = "fixed";
	reportCanvas.style.top = (window.innerHeight-reportCanvas.height)/2;
	reportCanvas.style.left = parseInt(mainCanvas.style.left)-reportCanvas.width-50;
	reportCanvas.ondrag = CanvasDragEvent; //Drag event for the canvas
}

function ReportCanvasLoop(){
	reportContext.fillStyle = "#000000";
	reportContext.strokeStyle = "#FFFFFF";
	reportContext.fillRect(0,0,reportCanvas.width,reportCanvas.height);
	reportContext.strokeRect(0,0,reportCanvas.width,reportCanvas.height);
	reportContext.fillStyle = "#FFFFFF";
	reportContext.fillText("Current Time: "+ currentTime,4,10);
	var yPos = 20;
	for(var i = 0; i < bodyField.bodies.length&&yPos+10<reportCanvas.height;i++){
		reportContext.fillText("X: " + bodyField.bodies[i].pos.x.toFixed(numberWidth) + ",Y: " + bodyField.bodies[i].pos.y.toFixed(numberWidth) + ",XVel: " + bodyField.bodies[i].vel.x.toFixed(numberWidth) + ",YVel: " + bodyField.bodies[i].vel.y.toFixed(numberWidth),4,yPos);
		yPos+=10;
	}
	setTimeout(ReportCanvasLoop,30);
}