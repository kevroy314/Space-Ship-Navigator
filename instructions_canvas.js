//Elements which are being tagged
var reportCanvas;
var mainCanvas;
var inputDiv;
var outputDiv;

//Instruction canvas and context
var instructionCanvas;
var instructionContext;

//Iterval for render/update loop
var instructionRenderInterval;

//Fade variables
var fadeSpeed;
var fadeAmount;
var fadeFlag; //Set to true to close the instructions, reinitialize to reappear
var faded;

//Mouse variables for draggability of instruction windows
var mouseDown;
var mouseDownPos;
var lastMousePos;
var currentMousePos;
var mouseOffset;

//Array of instructions
var instructions;

//Init function (call first)
function InitializeInstructionCanvas(){
	//This instruction canvas will loop at approximately 33fps
	instructionRenderInterval = 30;
	
	fadeSpeed = 0.1; //Smalle fade speed = slower fade, bigger = faster
	fadeAmount = 0; //Variable to keep track of how much we've faded. 1 = all faded, 0 = no fade
	fadeFlag = false; //Set externally to trigger instruction fade
	faded = false; //Flag that lets us know if we've finished fading
	
	//Elements which are being tagged
	reportCanvas = document.getElementById("reportCanvas");
	mainCanvas = document.getElementById("mainCanvas");
	inputDiv = document.getElementById("inputInstructions");
	outputDiv = document.getElementById("initialParams");

	//Canvas and context for drawing
	instructionCanvas = document.getElementById("instructionCanvas");
	instructionContext = instructionCanvas.getContext("2d");
	
	//Register mouse events
	instructionCanvas.onmousedown = instructionMouseDownEvent;
	instructionCanvas.onmouseup = instructionMouseUpEvent;
	instructionCanvas.onmousemove = instructionMouseMoveEvent;
	
	//Reset mouse locations
	lastMousePos = {X: 0, Y: 0};
	currentMousePos = {X: 0, Y: 0};
	
	//Set width to match window
	instructionCanvas.width = document.body.offsetWidth;
	instructionCanvas.height = document.body.offsetHeight;

	//Init instructions
	InitializeInstructions();
	
	//Begin looping!
	InstructionCanvasLoop();
}

//Init the instructions locations and values
function InitializeInstructions(){
	//Center of window and offset for each box from edge
	var xCenter = instructionCanvas.width/2;
	var yCenter = instructionCanvas.height/2;
	var xOffset = instructionCanvas.width/2.5;
	var yOffset = instructionCanvas.height/2.5;
	
	//Instructions!
	instructions = new Array();
	instructions[0] = new Instruction(reportCanvas.offsetLeft+reportCanvas.width/2,reportCanvas.offsetTop+reportCanvas.height/2,xCenter-xOffset,yCenter-yOffset,new Array("This is the report canvas. It shows","the current values of simulation","parameters. They are rounded","and do not represent the full","precisions of the simulation."));
	instructions[1] = new Instruction(mainCanvas.offsetLeft+mainCanvas.width/2,mainCanvas.offsetTop+mainCanvas.height/2,xCenter+xOffset,yCenter-yOffset,new Array("This is the main simulation","area. It shows the state of the","simulation. You can control the ","ship manually with the arrow keys.","R replays the level.","N starts a new level."));
	instructions[2] = new Instruction(inputDiv.offsetLeft+parseInt(inputDiv.offsetWidth,10)/2,inputDiv.offsetTop+parseInt(inputDiv.offsetHeight,10)/2,xCenter-xOffset,yCenter+yOffset,new Array("In addition to controlling the","ship manually, you can input","instructions which will be","executed at given moments."));
	instructions[3] = new Instruction(outputDiv.offsetLeft+outputDiv.offsetWidth/2,outputDiv.offsetTop+outputDiv.offsetHeight/2,xCenter+xOffset,yCenter+yOffset,new Array("This is the output window. It","shows the precise initial conditions","of the simulation (nothing is rounded)","as well as some simulation parameters."));
	instructions[4] = new Instruction(xCenter,10,xCenter,10,new Array("Press ESC to Close Instructions"));
	
	//Call init on each to calculate box width,height, and center
	for(var i = 0; i < instructions.length;i++)
		instructions[i].init(instructionContext);
	
	//Set the Close instruction to the center
	instructions[4].iX = xCenter-instructions[4].width/2;
}

//Canvas render/udpate loop
function InstructionCanvasLoop(){
	//Clear screen
	instructionContext.clearRect(0,0,instructionCanvas.width,instructionCanvas.height);
	
	//Update focal point positions to keep tethered to objects
	instructions[0].fX = reportCanvas.offsetLeft+reportCanvas.width/2;
	instructions[0].fY = reportCanvas.offsetTop+reportCanvas.height/2;
	instructions[1].fX = mainCanvas.offsetLeft+mainCanvas.width/2;
	instructions[1].fY = mainCanvas.offsetTop+mainCanvas.height/2;
	instructions[2].fX = inputDiv.offsetLeft+inputDiv.offsetWidth/2;
	instructions[2].fY = inputDiv.offsetTop+inputDiv.offsetHeight/2;
	instructions[3].fX = outputDiv.offsetLeft+outputDiv.offsetWidth/2;
	instructions[3].fY = outputDiv.offsetTop+outputDiv.offsetHeight/2;
	
	//Update based on mouse dragging and redraw all instructions
	for(var i = 0; i < instructions.length;i++){
		instructions[i].update(mouseDownPos,mouseOffset);
		instructions[i].render(instructionContext);
	}
	
	//Reset the mouse offset so the events know we've read the values
	mouseOffset = {X: 0, Y: 0};
	
	//If the fad flag is hit, we start executing fade logic
	if(fadeFlag){
		//Fill a partially transparent rectangle on top of the instructions
		instructionContext.fillStyle = "rgba(0,0,0,"+fadeAmount+")";
		instructionContext.fillRect(0,0,instructionCanvas.width,instructionCanvas.height);
		//Decrease transparency
		fadeAmount+=fadeSpeed;
	}
	
	//If it's fully faded, set the flag
	if(fadeAmount>=1)
		faded = true;
	
	//If it's not faded, repeat loop
	if(!faded)
		setTimeout(InstructionCanvasLoop,instructionRenderInterval);
}

//Mouse down event
function instructionMouseDownEvent(e){
	//Set mouse down flag, set position, update mouse position
	mouseDown = true;
	mouseDownPos = {X: e.offsetX, Y: e.offsetY};
	lastMousePos = currentMousePos;
	currentMousePos = {X: e.offsetX, y: e.offsetY};
	//Stop the event fromp assing on to prevent weird highlighting of screen objects
	return false;
	
}

//Mouse up event
function instructionMouseUpEvent(e){
	//Reset flag, position and update mouse mosition
	mouseDown = false;
	mouseDownPos = null;
	lastMousePos = currentMousePos;
	currentMousePos = {X: e.offsetX, y: e.offsetY};
	//Make sure no instructions think they're dragging
	for(var i = 0; i < instructions.length;i++)
		instructions[i].dragging = false;
}

//Mouse move event
function instructionMouseMoveEvent(e){
	//Update mouse position
	lastMousePos = currentMousePos;
	currentMousePos = {X: e.offsetX, Y: e.offsetY};
	mouseOffset.X += currentMousePos.X-lastMousePos.X;
	mouseOffset.Y += currentMousePos.Y-lastMousePos.Y;
}

//Simple counter class which takes a minmimum value, maximum value, step, increment/decrement boolean, and start value
//It will perform modularly (loop back around to min or max once boundry is hit)
function EngineCounter(min, max, step, increment, startVal){
	this.min = min;
	this.max = max;
	this.step = step;
	this.increment = increment;
	this.count = startVal; //Get this value to get the current state
	this.tick = function(){ //Call this to increment
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

//This is the instruction object. It takes a focal point, instruction point, and array of lines of text
function Instruction(focusX,focusY,instructionX,instructionY,textLinesArray){
	this.fX = focusX;
	this.fY = focusY;
	this.iX = instructionX; //instruction left
	this.iY = instructionY; //instruction top
	this.cX = instructionX; //instruction center left, set by init
	this.cY = instructionY; //instruction center top, set by init
	this.text = textLinesArray;
	this.textOffsetX = 0;
	this.textOffsetY = 8; //Font size dependent, changing the font will likely require this to change
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
	this.pulse = true; //Make the lines pulse, toggle this at any time to enable/disable pulsing
	this.pulseWidthIntensity = 10;
	this.verticalSpacing = 10; //Font size dependent, changing the font will likely require this to change
	this.width = 0; //Set by init
	this.height = 0; //Set by init
	this.counter = new EngineCounter(0,1000,0.1,true,0); //Determines the pulse rate
	this.dragging = false;
	this.init = function(ctx){ //Should be called before the instruction is used
		this.width = 0;
		for(var i = 0; i < this.text.length;i++){
			var l = ctx.measureText(this.text[i]).width;
			if(this.width<l) this.width = l;
		}
		//Set the width and height of the box
		this.width+=this.textPaddingLeft+this.textPaddingRight;
		this.height = this.verticalSpacing*this.text.length+this.textPaddingTop+this.textPaddingBottom;
		//Set the center variables
		this.cX = this.iX+this.width/2;
		this.cY = this.iU+this.height/2;
	}
	this.update = function(mdLoc,offset){
		//Check to make sure we're suppoed to move the instruction
		if(mdLoc!=null&&offset!=null){
			//If the click was in the box, start dragging mode
			if(mdLoc.X>this.iX&&mdLoc.X<this.iX+this.width&&mdLoc.Y>this.iY&&mdLoc.Y<this.iY+this.height)
				this.dragging = true;
			if(this.dragging){
				//If the offset values are valid, move x
				if(!isNaN(offset.X)&&offset.X!=0){
					this.iX+=offset.X;
					this.cX = this.iX+this.width/2;
				}
				//If the offset values are valid, move y
				if(!isNaN(offset.Y)&&offset.Y!=0){
					this.iY+=offset.Y;
					this.cY = this.iY+this.height/2;
				}
			}
		}
		if(this.pulse){
			//If we're pulsing, calculate the new line width, set it, and tick
			this.vLineWidth = (this.lineWidth*Math.cos(this.counter.count))+(this.lineWidth)+1;
			this.counter.tick();
		}
	}
	this.render = function(ctx){
		//Draw the line
		ctx.beginPath();
		ctx.moveTo(this.fX,this.fY);
		ctx.lineTo(this.iX+this.width/2,this.iY+this.height/2);
		ctx.closePath();
		ctx.lineWidth = this.vLineWidth;
		ctx.strokeStyle = this.lineColor;
		ctx.stroke();
		//Draw the box line
		ctx.lineWidth = this.boxLineWidth;
		ctx.strokeStyle = this.boxColor;
		ctx.strokeRect(this.iX,this.iY,this.width,this.height);
		//Fill the box
		ctx.fillStyle = this.boxInternalColor;
		ctx.fillRect(this.iX,this.iY,this.width,this.height);
		//Draw the instruction text
		ctx.lineWidth = this.textLineWidth;
		ctx.fillStyle = this.textColor;
		for(var i = 0; i < this.text.length;i++)
			ctx.fillText(this.text[i],this.iX+this.textPaddingLeft+this.textOffsetX,this.iY+this.textPaddingTop+this.textOffsetY+(i*this.verticalSpacing));
	}
}