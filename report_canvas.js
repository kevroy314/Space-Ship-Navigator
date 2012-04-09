var reportCanvas;
var reportContext;
var positionWidth = 3;
var velocityWidth = 7;
function InitializeReportCanvas(){
	reportCanvas = document.getElementById("reportCanvas");
	reportContext = reportCanvas.getContext("2d");
	reportCanvas.style.position = "fixed";
	reportCanvas.height = bodyField.bodies.length*10+23;
	reportCanvas.style.top = (window.innerHeight-reportCanvas.height)/2;
	reportCanvas.style.left = 10;
	reportCanvas.ondrag = CanvasDragEvent; //Drag event for the canvas
}

function ReportCanvasLoop(){
	reportContext.fillStyle = "#000000";
	reportContext.fillRect(0,0,reportCanvas.width,reportCanvas.height);
	reportContext.strokeStyle = "#FFFFFF";
	reportContext.strokeRect(0,0,reportCanvas.width,reportCanvas.height);
	reportContext.fillStyle = "#FFFFFF";
	reportContext.fillText("Current Time: " + currentTime + ", Time Step: " + timeStep,4,10);
	var yPos = 20;
	for(var i = 0; i < bodyField.bodies.length&&yPos+10<reportCanvas.height;i++){
		reportContext.fillText(i+" - X: " + bodyField.bodies[i].pos.x.toFixed(positionWidth) + ",Y: " + bodyField.bodies[i].pos.y.toFixed(positionWidth) + ",XVel: " + bodyField.bodies[i].vel.x.toFixed(velocityWidth) + ",YVel: " + bodyField.bodies[i].vel.y.toFixed(velocityWidth),4,yPos);
		yPos+=10;
	}
	reportContext.fillText("P - X: " + pc.pos.x.toFixed(positionWidth) + ",Y: " + pc.pos.y.toFixed(positionWidth) + ",XVel: " + pc.vel.x.toFixed(velocityWidth) + ",YVel: " + pc.vel.y.toFixed(velocityWidth),4,yPos);
	setTimeout(ReportCanvasLoop,30);
}