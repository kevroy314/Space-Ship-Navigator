function ReportCanvas(){
	//Report canvas and context for drawing
	this.reportCanvas;
	this.reportContext;

	//Determines how fast we update/redraw, approximately 33fps
	this.reportCanvasRenderInterval = 30;

	//Text properties
	this.positionWidth = 3; //Width in digits of position information
	this.velocityWidth = 7; //Width in digits of velocity information
	this.reportCanvasLeftPadding = 4; //Padding on the left of the box
	
	this.InitializeReportCanvas = function(){
		//Get canvas and context
		this.reportCanvas = document.createElement('canvas');
		document.body.appendChild(this.reportCanvas);
		this.reportCanvas.setAttribute('id','reportCanvas');
		this.reportCanvas.style.zIndex = 2;
		this.reportCanvas.tabIndex = 1;
		$("#reportCanvas").draggable();
		
		this.reportCanvas = document.getElementById("reportCanvas");
		this.reportContext = this.reportCanvas.getContext("2d");
		
		//Fixed position, look out for if anything has been dragged and set variables accordingly
		this.reportCanvas.style.position = "fixed";
		if(!hasBeenDragged){
			this.reportCanvas.height = bodyField.bodies.length*textSpacing+2*textSpacing+this.reportCanvasLeftPadding;
			this.reportCanvas.style.top = (window.innerHeight-this.reportCanvas.height)/2;
			this.reportCanvas.style.left = parseInt(canvas.style.left,10)-this.reportCanvas.width-textSpacing;
		}
		
		this.reportCanvas.ondrag = CanvasDragEvent; //Drag event for the canvas
		
		//Apply focus if clicked
		this.reportCanvas.onmousedown = this.Bind(function(){this.reportCanvas.focus();return false;});
		
		//Start looping
		this.ReportCanvasLoop();
	}

	this.ReportCanvasLoop = function(){
		//Fill background and draw border
		this.reportContext.fillStyle = "#000000";
		this.reportContext.fillRect(0,0,this.reportCanvas.width,this.reportCanvas.height);
		this.reportContext.strokeStyle = "#FFFFFF";
		this.reportContext.strokeRect(0,0,this.reportCanvas.width,this.reportCanvas.height);
		
		//Write time and time step
		this.reportContext.fillStyle = "#FFFFFF";
		this.reportContext.fillText("Current Time: " + currentTime + ", Time Step: " + timeStep,this.reportCanvasLeftPadding,textSpacing);
		
		//Write all lines of object data
		var yPos = 2*textSpacing;
		for(var i = 0; i < bodyField.bodies.length&&yPos+textSpacing<this.reportCanvas.height;i++){
			this.reportContext.fillText(i+" - X: " + bodyField.bodies[i].pos.x.toFixed(this.positionWidth) + ",Y: " + bodyField.bodies[i].pos.y.toFixed(this.positionWidth) + ",XVel: " + bodyField.bodies[i].vel.x.toFixed(this.velocityWidth) + ",YVel: " + bodyField.bodies[i].vel.y.toFixed(this.velocityWidth),this.reportCanvasLeftPadding,yPos);
			yPos+=textSpacing;
		}
		//Write player information
		this.reportContext.fillText("P - X: " + pc.pos.x.toFixed(this.positionWidth) + ",Y: " + pc.pos.y.toFixed(this.positionWidth) + ",XVel: " + pc.vel.x.toFixed(this.velocityWidth) + ",YVel: " + pc.vel.y.toFixed(this.velocityWidth),this.reportCanvasLeftPadding,yPos);
		
		//Loop!
		setTimeout(this.Bind(this.ReportCanvasLoop),this.reportCanvasRenderInterval);
	}
	
	//Simple reposition function for when the window is resized
	this.reposition = function(left,top){
		this.reportCanvas.style.top = top;
		this.reportCanvas.style.left = left;
	}
	
	//Bind function allowing the render/update loop to run with consistent data
	this.Bind = function(Method){
		var that = this;
		return(function(){return(Method.apply(that,arguments));});
    }
}