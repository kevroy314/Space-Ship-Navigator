function InstructionsBackground(){//Elements which are being tagged
	//The elements the instructions are bound to
	this.boundElements = new Array();

	//Instruction canvas and context
	this.instructionCanvas;
	this.instructionContext;

	//Iterval for render/update loop, approximately 33fps
	this.instructionRenderInterval = 30;

	//Fade variables
	this.fadeSpeed = 0.1; //Smalle fade speed = slower fade, bigger = faster
	this.fadeAmount = 0; //Variable to keep track of how much we've faded. 1 = all faded, 0 = no fade
	this.fadeFlag = false; //Set externally to trigger instruction fade
	this.faded = false; //Flag that lets us know if we've finished fading

	//Mouse variables for draggability of instruction windows
	this.mouseDown;
	this.mouseDownPos;
	this.lastMousePos = {X: 0, Y: 0};
	this.currentMousePos = {X: 0, Y: 0};
	this.mouseOffset = {X: 0, Y: 0};

	//Array of instructions
	this.instructions;
	
	//Init function (call first)
	this.InitializeInstructionCanvas = function(){
		//Create the canvas in the calling document
		this.instructionCanvas = document.createElement('canvas');
		document.body.appendChild(this.instructionCanvas);
		this.instructionCanvas.setAttribute('id','instructionCanvas');
		this.instructionCanvas.style.zIndex = 0;
		this.instructionCanvas.style.position = 'absolute';
		this.instructionCanvas.width = document.body.offsetWidth;
		this.instructionCanvas.height = document.body.offsetHeight;
		this.instructionCanvas.style.top = "0px";
		this.instructionCanvas.style.left = "0px";
		
		//Canvas and context for drawing
		this.instructionContext = this.instructionCanvas.getContext("2d");
		
		//Register mouse events
		this.instructionCanvas.onmousedown = this.Bind(this.instructionMouseDownEvent);
		this.instructionCanvas.onmouseup = this.Bind(this.instructionMouseUpEvent);
		this.instructionCanvas.onmousemove = this.Bind(this.instructionMouseMoveEvent);

		//Init instructions
		this.InitializeInstructions();
		
		//Begin looping!
		this.InstructionCanvasLoop();
	}

	//Init the instructions locations and values
	//NOTE: This is the only function which is application specific. To change the instructions, rewrite this function.
	this.InitializeInstructions = function(){
		this.boundElements[0] = document.getElementById("reportCanvas");
		this.boundElements[1] = document.getElementById("mainCanvas");
		this.boundElements[2] = document.getElementById("inputInstructions");
		this.boundElements[3] = document.getElementById("initialParams");
	
		//Center of window and offset for each box from edge
		var xCenter = this.instructionCanvas.width/2;
		var yCenter = this.instructionCanvas.height/2;
		var xOffset = this.instructionCanvas.width/2.5;
		var yOffset = this.instructionCanvas.height/2.5;
		
		//Instructions!
		this.instructions = new Array();
		this.instructions[0] = new Instruction(this.boundElements[0].offsetLeft+this.boundElements[0].width/2,this.boundElements[0].offsetTop+this.boundElements[0].height/2,xCenter-xOffset,yCenter-yOffset,new Array("This is the report canvas. It shows","the current values of simulation","parameters. They are rounded","and do not represent the full","precisions of the simulation."));
		this.instructions[1] = new Instruction(this.boundElements[1].offsetLeft+this.boundElements[1].width/2,this.boundElements[1].offsetTop+this.boundElements[1].height/2,xCenter+xOffset,yCenter-yOffset,new Array("This is the main simulation","area. It shows the state of the","simulation. You can control the ","ship manually with the arrow keys.","R replays the level.","N starts a new level."));
		this.instructions[2] = new Instruction(this.boundElements[2].offsetLeft+parseInt(this.boundElements[2].offsetWidth,10)/2,this.boundElements[2].offsetTop+parseInt(this.boundElements[2].offsetHeight,10)/2,xCenter-xOffset,yCenter+yOffset,new Array("In addition to controlling the","ship manually, you can input","instructions which will be","executed at given moments."));
		this.instructions[3] = new Instruction(this.boundElements[3].offsetLeft+this.boundElements[3].offsetWidth/2,this.boundElements[3].offsetTop+this.boundElements[3].offsetHeight/2,xCenter+xOffset,yCenter+yOffset,new Array("This is the output window. It","shows the precise initial conditions","of the simulation (nothing is rounded)","as well as some simulation parameters."));
		this.instructions[4] = new Instruction(xCenter,10,xCenter,10,new Array("Press ESC to Close Instructions"));
		
		//Call init on each to calculate box width,height, and center
		for(var i = 0; i < this.instructions.length;i++)
			this.instructions[i].init(this.instructionContext);
		
		//Set the Close instruction to the center
		this.instructions[4].iX = xCenter-this.instructions[4].width/2;
	}

	//Canvas render/udpate loop
	this.InstructionCanvasLoop = function(){
		//Clear screen
		this.instructionContext.clearRect(0,0,this.instructionCanvas.width,this.instructionCanvas.height);
		
		//Update focal point positions to keep tethered to objects
		for(var i = 0; i < this.boundElements.length;i++){
			this.instructions[i].fX = this.boundElements[i].offsetLeft+this.boundElements[i].offsetWidth/2;
			this.instructions[i].fY = this.boundElements[i].offsetTop+this.boundElements[i].offsetHeight/2;
		}
		
		//Update based on mouse dragging and redraw all instructions
		for(var i = 0; i < this.instructions.length;i++){
			this.instructions[i].update(this.mouseDownPos,this.mouseOffset);
			this.instructions[i].render(this.instructionContext);
		}
		
		//Reset the mouse offset so the events know we've read the values
		this.mouseOffset = {X: 0, Y: 0};
		
		//If the fad flag is hit, we start executing fade logic
		if(this.fadeFlag){
			//Fill a partially transparent rectangle on top of the instructions
			this.instructionContext.fillStyle = "rgba(0,0,0,"+this.fadeAmount+")";
			this.instructionContext.fillRect(0,0,this.instructionCanvas.width,this.instructionCanvas.height);
			//Decrease transparency
			this.fadeAmount+=this.fadeSpeed;
		}
		
		//If it's fully faded, set the flag
		if(this.fadeAmount>=1)
			this.faded = true;
		
		//If it's not faded, repeat loop
		if(!this.faded)
			setTimeout(this.Bind(this.InstructionCanvasLoop),this.instructionRenderInterval);
	}

	this.resize = function(width,height){
		this.instructionCanvas.width = width;
		this.instructionCanvas.height = height;
		if(!this.faded&&this.fadeAmount==0){
			this.InitializeInstructions();
	}
	}

	//Mouse down event
	this.instructionMouseDownEvent = function(e){
		//Set mouse down flag, set position, update mouse position
		this.mouseDown = true;
		this.mouseDownPos = {X: e.offsetX, Y: e.offsetY};
		this.lastMousePos = this.currentMousePos;
		this.currentMousePos = {X: e.offsetX, y: e.offsetY};
		//Stop the event fromp assing on to prevent weird highlighting of screen objects
		return false;
		
	}
	
	//Mouse up event
	this.instructionMouseUpEvent = function(e){
		//Reset flag, position and update mouse mosition
		this.mouseDown = false;
		this.mouseDownPos = null;
		this.lastMousePos = this.currentMousePos;
		this.currentMousePos = {X: e.offsetX, y: e.offsetY};
		//Make sure no instructions think they're dragging
		for(var i = 0; i < this.instructions.length;i++)
			this.instructions[i].dragging = false;
	}

	//Mouse move event
	this.instructionMouseMoveEvent = function(e){
		//Update mouse position
		this.lastMousePos = {X: this.currentMousePos.X, Y: this.currentMousePos.Y};
		this.currentMousePos = {X: e.offsetX, Y: e.offsetY};
		this.mouseOffset.X += this.currentMousePos.X-this.lastMousePos.X;
		this.mouseOffset.Y += this.currentMousePos.Y-this.lastMousePos.Y;
	}

	//Bind function allowing the render/update loop to run with consistent data
	this.Bind = function(Method){
		var that = this;
		return(function(){return(Method.apply(that,arguments));});
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
}