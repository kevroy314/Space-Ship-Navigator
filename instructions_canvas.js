var reportCanvas;
var mainCanvas;
var inputDiv;
var outputDiv;

var instructionCanvas;
var instructionContext;

var instructionRenderInterval = 30;
var fadeSpeed = 0.1;
var fadeAmount = 0;
var fadeFlag = false;
var faded = false

var mouseDown;
var mouseDownPos;
var lastMousePos;
var currentMousePos;
var mouseOffset;

var instructions;

function InitializeInstructionCanvas(){
	reportCanvas = document.getElementById("reportCanvas");
	mainCanvas = document.getElementById("mainCanvas");
	inputDiv = document.getElementById("inputInstructions");
	outputDiv = document.getElementById("initialParams");

	instructionCanvas = document.getElementById("instructionCanvas");
	instructionContext = instructionCanvas.getContext("2d");
	
	instructionCanvas.onmousedown = instructionMouseDownEvent;
	instructionCanvas.onmouseup = instructionMouseUpEvent;
	instructionCanvas.onmousemove = instructionMouseMoveEvent;
	
	lastMousePos = {X: 0, Y: 0};
	currentMousePos = {X: 0, Y: 0};
	
	instructionCanvas.width = document.body.offsetWidth;
	instructionCanvas.height = document.body.offsetHeight;

	var xCenter = instructionCanvas.width/2;
	var yCenter = instructionCanvas.height/2;
	var xOffset = instructionCanvas.width/2.5;
	var yOffset = instructionCanvas.height/2.5;
	
	instructions = new Array();
	instructions[0] = new Instruction(reportCanvas.offsetLeft+reportCanvas.width/2,reportCanvas.offsetTop+reportCanvas.height/2,xCenter-xOffset,yCenter-yOffset,new Array("This is the report canvas. It shows","the current values of simulation","parameters. They are rounded","and do not represent the full","precisions of the simulation."));
	instructions[1] = new Instruction(mainCanvas.offsetLeft+mainCanvas.width/2,mainCanvas.offsetTop+mainCanvas.height/2,xCenter+xOffset,yCenter-yOffset,new Array("This is the main simulation","area. It shows the state of the","simulation. You can control the ","ship manually with the arrow keys.","R replays the level.","N starts a new level."));
	instructions[2] = new Instruction(inputDiv.offsetLeft+parseInt(inputDiv.offsetWidth,10)/2,inputDiv.offsetTop+parseInt(inputDiv.offsetHeight,10)/2,xCenter-xOffset,yCenter+yOffset,new Array("In addition to controlling the","ship manually, you can input","instructions which will be","executed at given moments."));
	instructions[3] = new Instruction(outputDiv.offsetLeft+outputDiv.offsetWidth/2,outputDiv.offsetTop+outputDiv.offsetHeight/2,xCenter+xOffset,yCenter+yOffset,new Array("This is the output window. It","shows the precise initial conditions","of the simulation (nothing is rounded)","as well as some simulation parameters."));
	instructions[4] = new Instruction(xCenter,10,xCenter,10,new Array("Press ESC to Close Instructions"));
	for(var i = 0; i < instructions.length;i++)
		instructions[i].init(instructionContext);
	instructions[4].iX = xCenter-instructions[4].width/2;
}

function instructionMouseDownEvent(e){
	mouseDown = true;
	mouseDownPos = {X: e.offsetX, Y: e.offsetY};
	lastMousePos = currentMousePos;
	currentMousePos = {X: e.offsetX, y: e.offsetY};
	return false;
	
}
function instructionMouseUpEvent(e){
	mouseDown = false;
	mouseDownPos = null;
	lastMousePos = currentMousePos;
	currentMousePos = {X: e.offsetX, y: e.offsetY};
	for(var i = 0; i < instructions.length;i++)
		instructions[i].dragging = false;
}
function instructionMouseMoveEvent(e){
	lastMousePos = currentMousePos;
	currentMousePos = {X: e.offsetX, Y: e.offsetY};
	mouseOffset.X += currentMousePos.X-lastMousePos.X;
	mouseOffset.Y += currentMousePos.Y-lastMousePos.Y;
}
function InstructionCanvasLoop(){
	instructionContext.clearRect(0,0,instructionCanvas.width,instructionCanvas.height);
	
	instructions[0].fX = reportCanvas.offsetLeft+reportCanvas.width/2;
	instructions[0].fY = reportCanvas.offsetTop+reportCanvas.height/2;
	instructions[1].fX = mainCanvas.offsetLeft+mainCanvas.width/2;
	instructions[1].fY = mainCanvas.offsetTop+mainCanvas.height/2;
	instructions[2].fX = inputDiv.offsetLeft+inputDiv.offsetWidth/2;
	instructions[2].fY = inputDiv.offsetTop+inputDiv.offsetHeight/2;
	instructions[3].fX = outputDiv.offsetLeft+outputDiv.offsetWidth/2;
	instructions[3].fY = outputDiv.offsetTop+outputDiv.offsetHeight/2;
	
	for(var i = 0; i < instructions.length;i++){
		instructions[i].update(mouseDownPos,mouseOffset);
		instructions[i].render(instructionContext);
	}
	
	mouseOffset = {X: 0, Y: 0};
	
	if(fadeFlag){
		instructionContext.fillStyle = "rgba(0,0,0,"+fadeAmount+")";
		instructionContext.fillRect(0,0,instructionCanvas.width,instructionCanvas.height);
		fadeAmount+=fadeSpeed;
	}
	
	if(fadeAmount>=1)
		faded = true;
	
	if(!faded)
		setTimeout(InstructionCanvasLoop,instructionRenderInterval);
}

function EngineCounter(min, max, step, increment, startVal){
	this.min = min;
	this.max = max;
	this.step = step;
	this.increment = increment;
	this.count = startVal;
	this.tick = function(){
		if(this.increment){
			this.count += this.step;
			if(this.count>this.max) this.count = this.min;
		}
		else{
			this.count -= this.step;
			if(this.count<this.min) this.count = this.max;
		}
	}
}

function Instruction(focusX,focusY,instructionX,instructionY,textLinesArray,width,height){
	this.fX = focusX;
	this.fY = focusY;
	this.iX = instructionX; //instruction left
	this.iY = instructionY; //instruction top
	this.cX = instructionX; //instruction center left
	this.cY = instructionY; //instruction center top
	this.text = textLinesArray;
	this.textOffsetX = 0;
	this.textOffsetY = 8;
	this.textPaddingLeft = 2;
	this.textPaddingTop = 2;
	this.textPaddingRight = 2;
	this.textPaddingBottom = 2;
	this.lineWidth = 1;
	this.minLineWidth = 1;
	this.vLineWidth = 1;
	this.textLineWidth = 1;
	this.boxLineWidth = 1;
	this.boxColor = "#FF0000";
	this.boxInternalColor = "rgba(0,0,0,1)";
	this.textColor = "#FF0000";
	this.lineColor = "#FF0000";
	this.pulse = true;
	this.pulseWidthIntensity = 10;
	this.verticalSpacing = 10;
	this.width = 0;
	this.height = 0;
	this.counter = new EngineCounter(0,1000,0.1,true,0);
	this.dragging = false;
	this.init = function(ctx){
		this.width = 0;
		for(var i = 0; i < this.text.length;i++){
			var l = ctx.measureText(this.text[i]).width;
			if(this.width<l) this.width = l;
		}
		this.width+=this.textPaddingLeft+this.textPaddingRight;
		this.height = this.verticalSpacing*this.text.length+this.textPaddingTop+this.textPaddingBottom;
		this.cX = this.iX+this.width/2;
		this.cY = this.iU+this.height/2;
	}
	this.update = function(mdLoc,offset){
		if(mdLoc!=null&&offset!=null){
			if(mdLoc.X>this.iX&&mdLoc.X<this.iX+this.width&&mdLoc.Y>this.iY&&mdLoc.Y<this.iY+this.height)
				this.dragging = true;
			if(this.dragging){
				if(!isNaN(offset.X)&&offset.X!=0){
					this.iX+=offset.X;
					this.cX = this.iX+this.width/2;
				}
				if(!isNaN(offset.Y)&&offset.Y!=0){
					this.iY+=offset.Y;
					this.cY = this.iY+this.height/2;
				}
			}
		}
		if(this.pulse){
			this.vLineWidth = (this.lineWidth*Math.cos(this.counter.count))+(this.lineWidth)+1;
			this.counter.tick();
		}
	}
	this.render = function(ctx){
		ctx.beginPath();
		ctx.moveTo(this.fX,this.fY);
		ctx.lineTo(this.iX+this.width/2,this.iY+this.height/2);
		ctx.closePath();
		ctx.lineWidth = this.vLineWidth;
		ctx.strokeStyle = this.lineColor;
		ctx.stroke();
		ctx.lineWidth = this.boxLineWidth;
		ctx.strokeStyle = this.boxColor;
		ctx.strokeRect(this.iX,this.iY,this.width,this.height);
		ctx.fillStyle = this.boxInternalColor;
		ctx.fillRect(this.iX,this.iY,this.width,this.height);
		ctx.lineWidth = this.textLineWidth;
		ctx.fillStyle = this.textColor;
		for(var i = 0; i < this.text.length;i++)
			ctx.fillText(this.text[i],this.iX+this.textPaddingLeft+this.textOffsetX,this.iY+this.textPaddingTop+this.textOffsetY+(i*this.verticalSpacing));
	}
}