//Simple vector object
function Vector2(X,Y){
	this.x = X;
	this.y = Y;
}

//Body field controls all the gravitational bodies
function GBodyField(GBodies){
	this.bodies = GBodies;
	this.update = function(dt){ //Update given a dt (this is where the main computation for the simulation happens)
		var forceArray = new Array(this.bodies.length); //Array of computed forces
		for(var i = 0; i < this.bodies.length;i++){ //Compute each force
			forceArray[i] = new Array(this.bodies.length-i);
			var netForce = new Vector2(0,0); //Generate a net force for an object
			for(var j = 0; j < this.bodies.length;j++){ //For each object
				if(j<i){ //If we have computed this force before, look it up and rescale it to this current object mass
					netForce.x += (forceArray[j][i].x/(this.bodies[i].pos.x-this.bodies[j].pos.x))*(this.bodies[j].pos.x-this.bodies[i].pos.x);
					netForce.y += (forceArray[j][i].y/(this.bodies[i].pos.y-this.bodies[j].pos.y))*(this.bodies[j].pos.y-this.bodies[i].pos.y);
				}
				else if (j>i){ //If we haven't computed this force before, add it to the force array
					forceArray[i][j] = this.bodies[i].calculateForce(this.bodies[j]);
					netForce.x += forceArray[i][j].x;
					netForce.y += forceArray[i][j].y;
				}
			}
			//Perform Euler's Method
			this.bodies[i].vel.x+=(netForce.x/this.bodies[i].m)*dt;
			this.bodies[i].vel.y+=(netForce.y/this.bodies[i].m)*dt;
			this.bodies[i].pos.x+=this.bodies[i].vel.x*dt;
			this.bodies[i].pos.y+=this.bodies[i].vel.y*dt;
		}
	}
	this.render = function(ctx){ //Main draw function for the field
		for(var i = 0; i < this.bodies.length;i++){
			this.bodies[i].render(ctx); //Render the body
			
			if(drawLabels){ //Broken because of object blur
				overlayContext.fillStyle = gameStateTextColor;
				var drawX = this.bodies[i].pos.x;
				if(drawX+boundryPadding>overlayCanvas.width) drawX = overlayCanvas.width-boundryPadding;
				else if (drawX-overlayCanvasLeftPadding<0) drawX = overlayCanvasLeftPadding;
				var drawY = this.bodies[i].pos.y;
				if(drawY+boundryPadding/2>overlayCanvas.height) drawY = overlayCanvas.height-boundryPadding/2;
				if(drawY-boundryPadding<0) drawY = boundryPadding;
				overlayContext.fillText(""+i,drawX,drawY);
			}
		}
	}
}

//An object representing a single gravitational object
function GBody(Position, Velocity, Mass){
	this.pos = Position;
	this.vel = Velocity;
	this.m = Mass;
	this.displaySize = Math.log(Mass);
	this.color1 = "#FF7000";
	this.color2 = "FF0000";
	this.render = function(ctx){ //We can draw it with a gradient to make it look spherical
		//Create the gradient
		var gradientSize = this.displaySize/4;
		var gradient = ctx.createRadialGradient(this.pos.x-gradientSize,this.pos.y-gradientSize,gradientSize,this.pos.x,this.pos.y,this.displaySize);
		gradient.addColorStop(0,this.color1);
		gradient.addColorStop(0.5,this.color2);
		gradient.addColorStop(1,"rgba(0,0,0,0)");
		//Draw a circle
		fillCircle(ctx,this.pos.x,this.pos.y,this.displaySize,gradient);
	}
	this.calculateForce = function(body){ //Simple force calculation function
		//Calculate the changes in x and y direction and distance
		var dx = body.pos.x-this.pos.x;
		var dy = body.pos.y-this.pos.y;
		var d = Math.sqrt(dx*dx+dy*dy);
		//If the distances is too close, do not calculate force (prevents singularities)
		if(d<gravityDistanceThreshold) return new Vector2(0,0);
		//Create a force vector and return it
		var Fmodified = (this.m*body.m*G)/(d*d*d); //third 'd' is for unit vector
		dx*=Fmodified;
		dy*=Fmodified;
		return new Vector2(dx,dy);
	}
}

//Object representing the player character
function PlayerCharacter(startPosition,fuelCapacity,goalPosition){
	this.startPos = new Vector2(startPosition.x,startPosition.y); //Start position is a Vector2
	this.pos = new Vector2(startPosition.x,startPosition.y); //Current position is a Vector2
	this.color = "#7777FF";
	this.startColor1 = "#FFF0F0";
	this.startColor2 = "#FFFF00";
	this.goalColor1 = "#F0FFF0";
	this.goalColor2 = "#00FF00";
	this.decisionLineColor = "#0000FF";
	this.idleLineColor = "#FFFFFF";
	this.shipGeometry = new Array(new Vector2(0,5), new Vector2(2.0943951,2), new Vector2(4.1887902,2)); //Ship geometry represents a polar coordinate set of points which are connected to form the ship
	this.fuelCapacity = fuelCapacity; //Start fuel
	this.goalPos = goalPosition; //Goal position is a Vector2
	this.distToGoal = Math.sqrt((startPosition.x-goalPosition.x)*(startPosition.x-goalPosition.x)+(startPosition.y-goalPosition.y)*(startPosition.y-goalPosition.y)); //Calculate initial distance to goal
	this.bestDistToGoal = Math.sqrt((startPosition.x-goalPosition.x)*(startPosition.x-goalPosition.x)+(startPosition.y-goalPosition.y)*(startPosition.y-goalPosition.y)); //Set best distance to goal as initial
	this.fuel = fuelCapacity; //Set initial fuel
	this.power = 0.00001; //Ship default thrust under user control
	this.vel = new Vector2(0,0); //Starts stationary
	this.unitVel = new Vector2(1,0); //Unit vector for direction
	this.orientation = 0.0; //Radians orientation
	this.mass = 0.00000000001; //Mass is almost nothing
	this.markerSize = 5; //Size of the circles representing start and end points
	this.decisionFrameCount = 0; //Counter to draw the decision lines
	this.decisionArray = new Array(); //Not implemented
	this.turnAccuity = 0.1; //Amount to turn by default
	this.fuelRatio = 100000; //Inverse of amount of force a single unit of fuel generates
	this.update = function(bodies, dt){ //Update the ship position based on forces acting on it
		//Calculate forces
		var netForce = new Vector2(0,0);
		var myGBody = new GBody(this.pos,this.vel,this.mass);
		for(var i = 0; i < bodies.length;i++){
			var f = myGBody.calculateForce(bodies[i]);
			netForce.x += f.x;
			netForce.y += f.y;
		}
		//Euler's method
		this.vel.x += netForce.x/this.mass*dt;
		this.vel.y += netForce.y/this.mass*dt;
		this.pos.x+=this.vel.x*dt;
		this.pos.y+=this.vel.y*dt;
		//Calculate distance to goal
		this.distToGoal = Math.sqrt((this.pos.x-this.goalPos.x)*(this.pos.x-this.goalPos.x)+(this.pos.y-this.goalPos.y)*(this.pos.y-this.goalPos.y));
		//Update best distance to goal
		if(this.distToGoal<this.bestDistToGoal) this.bestDistToGoal = this.distToGoal;
	}
	this.render = function(ctx){ //Render the ship, it's goal/start point and it's path (blue for decision, white for coast)
		//Draw start position marker
		var gradientSize = this.markerSize/4;
		var startGradient = ctx.createRadialGradient(this.startPos.x-gradientSize,this.startPos.y-gradientSize,gradientSize,this.startPos.x,this.startPos.y,this.markerSize);
		startGradient.addColorStop(0,this.startColor1);
		startGradient.addColorStop(0.5,this.startColor2);
		startGradient.addColorStop(1,"rgba(0,0,0,0)");
		
		fillCircle(ctx,this.startPos.x,this.startPos.y,this.markerSize,startGradient);
		
		//Draw goal position marker
		var goalGradient = ctx.createRadialGradient(this.goalPos.x-gradientSize,this.goalPos.y-gradientSize,gradientSize,this.goalPos.x,this.goalPos.y,this.markerSize);
		goalGradient.addColorStop(0,this.goalColor1);
		goalGradient.addColorStop(0.5,this.goalColor2);
		goalGradient.addColorStop(1,"rgba(0,0,0,0)");
		
		fillCircle(ctx,this.goalPos.x,this.goalPos.y,this.markerSize,goalGradient);
		
		//If we're in a decision frame, set the fill color to decisionLineColor and decrement
		if(this.decisionFrameCount>0){
			overlayContext.fillStyle = this.decisionLineColor;
			this.decisionFrameCount--;
		}
		else //Otherwise set the idle line color
			overlayContext.fillStyle = this.idleLineColor;
		//Draw the path of the ship
		overlayContext.fillRect(this.pos.x,this.pos.y,1,1);
		
		//Draw the ship lines
		ctx.strokeStyle = this.color;
		ctx.lineWidth = 1;
		var startPoint = rotatePoint(new Vector2(this.pos.x+this.shipGeometry[0].y,this.pos.y),this.pos,this.orientation+this.shipGeometry[0].x);
		ctx.beginPath();
		ctx.moveTo(startPoint.x,startPoint.y);
		for(var i = 1; i < this.shipGeometry.length;i++){
			var point = rotatePoint(new Vector2(this.pos.x+this.shipGeometry[i].y,this.pos.y),this.pos,this.orientation+this.shipGeometry[i].x);
			ctx.lineTo(point.x,point.y);
		}
		ctx.lineTo(startPoint.x,startPoint.y);
		ctx.closePath();
		ctx.stroke();
	}
	//Apply a thrust to the ship (costs fuel)
	this.thrust = function(power){
		if(this.fuel-Math.abs(power)*this.fuelRatio>=0){
			this.decisionFrameCount = 10;
			this.fuel-=Math.abs(power)*this.fuelRatio;
			this.vel = new Vector2((this.unitVel.x)*power+this.vel.x,(this.unitVel.y)*power+this.vel.y);
		}
	}
	//Turn the ship (does not cost fuel)
	this.turn = function(angle){
		this.orientation = (this.orientation+angle)%(Math.PI*2);
		this.unitVel.x = Math.cos(this.orientation);
		this.unitVel.y = Math.sin(this.orientation);
		
	}
}

//A simple object representing a decision the user makes
function Decision(time, direction, power){
	this.time = time;
	this.direction = direction;
	this.power = power;
}