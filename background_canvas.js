var backgroundRenderInterval = 30;
var backgroundInstructionLineLength;
var backgroundInstructionLinePulseFactor = 10;
var backgroundInstructionLineCurrentLength;
var instructionVerticalSpacing = 10;
var backgroundCanvas;
var backgroundContext;

var outputElement;
var inputElement;
var canvasElement;
var reportElement;

var outputElementFocalPoint;
var inputElementFocalPoint;
var canvasElementFocalPoint;
var reportElementFocalPoint;

var outputElementStartPoint;
var inputElementStartPoint;
var canvasElementStartPoint;
var reportElementStartPoint;

var outputElementUnitVector;
var inputElementUnitVector;
var canvasElementUnitVector;
var reportElementUnitVector;

var lineWidthCounter;

function InitializeBackgroundCanvas(){
	backgroundCanvas = document.getElementById("backgroundCanvas");
	backgroundContext = backgroundCanvas.getContext("2d");

	backgroundCanvas.width = document.body.offsetWidth;
	backgroundCanvas.height = document.body.offsetHeight;
	
	backgroundInstructionLineLength = backgroundCanvas.width/5;
	backgroundInstructionLineCurrentLength = backgroundCanvas.width/5;
	
	outputElement = document.getElementById("initialParams");
	inputElement = document.getElementById("inputInstructions");
	canvasElement = document.getElementById("mainCanvas");
	reportElement = document.getElementById("reportCanvas");

	outputElementFocalPoint = new Vector2(outputElement.offsetLeft+outputElement.offsetWidth,
										  outputElement.offsetTop);
	inputElementFocalPoint = new Vector2(inputElement.offsetLeft,
										 inputElement.offsetTop+inputElement.offsetHeight);
	canvasElementFocalPoint = new Vector2(canvasElement.offsetLeft,
										  canvasElement.offsetTop);
	reportElementFocalPoint = new Vector2(reportElement.offsetLeft+reportElement.offsetWidth/2,
										  reportElement.offsetTop+reportElement.offsetHeight);
										  
	outputElementStartPoint = new Vector2(document.body.offsetWidth,
										  0);
	inputElementStartPoint = new Vector2(0,
										 document.body.offsetHeight);
	canvasElementStartPoint = new Vector2(0,
										  0);
	reportElementStartPoint = new Vector2(0,
										  document.body.offsetHeight*2/3);
	
	outputElementUnitVector = getUnitVector(outputElementFocalPoint,outputElementStartPoint);
	inputElementUnitVector = getUnitVector(inputElementFocalPoint,inputElementStartPoint);
	canvasElementUnitVector = getUnitVector(canvasElementFocalPoint,canvasElementStartPoint);
	reportElementUnitVector = getUnitVector(reportElementFocalPoint,reportElementStartPoint);
	
	lineWidthCounter = 0;
}

function BackgroundCanvasLoop(){
	backgroundContext.clearRect(0,0,backgroundCanvas.width,backgroundCanvas.height);
	
	var width = 3*Math.sin(lineWidthCounter)+5;
	
	backgroundContext.strokeStyle="#FF0000";
	backgroundContext.beginPath();
	var x = outputElementStartPoint.x+outputElementUnitVector.x*backgroundInstructionLineCurrentLength;
	var y = outputElementStartPoint.y+outputElementUnitVector.y*backgroundInstructionLineCurrentLength;
	backgroundContext.moveTo(x,y);
	backgroundContext.lineTo(outputElementFocalPoint.x,outputElementFocalPoint.y);
	backgroundContext.closePath();
	backgroundContext.lineWidth = 1;
	x = outputElementStartPoint.x+outputElementUnitVector.x*backgroundInstructionLineLength+backgroundInstructionLinePulseFactor;
	y = outputElementStartPoint.y+outputElementUnitVector.y*backgroundInstructionLineLength+backgroundInstructionLinePulseFactor;
	backgroundContext.strokeText("These are the values you can",x,y);
	backgroundContext.strokeText("use to solve the game!",x,y+instructionVerticalSpacing);
	backgroundContext.lineWidth = width;
	backgroundContext.stroke();
	
	backgroundContext.beginPath();
	x = inputElementStartPoint.x+inputElementUnitVector.x*backgroundInstructionLineCurrentLength;
	y = inputElementStartPoint.y+inputElementUnitVector.y*backgroundInstructionLineCurrentLength;
	backgroundContext.moveTo(x,y);
	backgroundContext.lineTo(inputElementFocalPoint.x,inputElementFocalPoint.y);
	backgroundContext.closePath();
	backgroundContext.lineWidth = 1;
	x = inputElementStartPoint.x+inputElementUnitVector.x*backgroundInstructionLineLength-backgroundInstructionLinePulseFactor;
	y = inputElementStartPoint.y+inputElementUnitVector.y*backgroundInstructionLineLength-backgroundInstructionLinePulseFactor;
	backgroundContext.strokeText("This is where you can program",x,y-instructionVerticalSpacing);
	backgroundContext.strokeText("your ship's instructions!",x,y);
	backgroundContext.lineWidth = width;
	backgroundContext.stroke();
	
	backgroundContext.beginPath();
	x = canvasElementStartPoint.x+canvasElementUnitVector.x*backgroundInstructionLineCurrentLength;
	y = canvasElementStartPoint.y+canvasElementUnitVector.y*backgroundInstructionLineCurrentLength;
	backgroundContext.moveTo(x,y);
	backgroundContext.lineTo(canvasElementFocalPoint.x,canvasElementFocalPoint.y);
	backgroundContext.closePath();
	backgroundContext.lineWidth = 1;
	x = canvasElementStartPoint.x+canvasElementUnitVector.x*backgroundInstructionLineLength-backgroundInstructionLinePulseFactor;
	y = canvasElementStartPoint.y+canvasElementUnitVector.y*backgroundInstructionLineLength-backgroundInstructionLinePulseFactor;
	backgroundContext.strokeText("This is the primary game area!",x,y-instructionVerticalSpacing);
	backgroundContext.strokeText("You can use the arrow keys to rotate and fire thrusters.",x,y);
	backgroundContext.lineWidth = width;
	backgroundContext.stroke();
	
	backgroundContext.beginPath();
	x = reportElementStartPoint.x+reportElementUnitVector.x*backgroundInstructionLineCurrentLength;
	y = reportElementStartPoint.y+reportElementUnitVector.y*backgroundInstructionLineCurrentLength;
	backgroundContext.moveTo(x,y);
	backgroundContext.lineTo(reportElementFocalPoint.x,reportElementFocalPoint.y);
	backgroundContext.closePath();
	backgroundContext.lineWidth = 1;
	x = reportElementStartPoint.x+reportElementUnitVector.x*backgroundInstructionLineLength-backgroundInstructionLinePulseFactor;
	y = reportElementStartPoint.y+reportElementUnitVector.y*backgroundInstructionLineLength+backgroundInstructionLinePulseFactor;
	backgroundContext.strokeText("This is the current status of the game!",x,y);
	backgroundContext.strokeText("It's read only and not to the full accuracy",x,y+instructionVerticalSpacing);
	backgroundContext.strokeText("of the simulation.",x,y+instructionVerticalSpacing*2);
	backgroundContext.lineWidth = width;
	backgroundContext.stroke();
	
	lineWidthCounter+=0.05;
	backgroundInstructionLineCurrentLength = backgroundInstructionLinePulseFactor*Math.sin(lineWidthCounter)+backgroundInstructionLineLength;
	
	setTimeout(BackgroundCanvasLoop,backgroundRenderInterval);
}