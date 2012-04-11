function Vector2(X,Y){
	this.x = X;
	this.y = Y;
}

function GBodyField(GBodies){
	this.bodies = GBodies;
	this.update = function(dt){
		var forceArray = new Array(this.bodies.length);
		for(var i = 0; i < this.bodies.length;i++){
			forceArray[i] = new Array(this.bodies.length-i);
			var netForce = new Vector2(0,0);
			for(var j = 0; j < this.bodies.length;j++){
				if(j<i){
					netForce.x += (forceArray[j][i].x/(this.bodies[i].pos.x-this.bodies[j].pos.x))*(this.bodies[j].pos.x-this.bodies[i].pos.x);
					netForce.y += (forceArray[j][i].y/(this.bodies[i].pos.y-this.bodies[j].pos.y))*(this.bodies[j].pos.y-this.bodies[i].pos.y);
				}
				else if (j>i){
					forceArray[i][j] = this.bodies[i].calculateForce(this.bodies[j]);
					netForce.x += forceArray[i][j].x;
					netForce.y += forceArray[i][j].y;
				}
			}
			this.bodies[i].vel.x+=(netForce.x/this.bodies[i].m)*dt;
			this.bodies[i].vel.y+=(netForce.y/this.bodies[i].m)*dt;
			this.bodies[i].pos.x+=this.bodies[i].vel.x*dt;
			this.bodies[i].pos.y+=this.bodies[i].vel.y*dt;
		}
	}
	this.render = function(ctx){
		for(var i = 0; i < this.bodies.length;i++){
			this.bodies[i].render(ctx);
			
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

function GBody(Position, Velocity, Mass){
	this.pos = Position;
	this.vel = Velocity;
	this.m = Mass;
	this.displaySize = Math.log(Mass);
	this.color1 = "#FF7000";
	this.color2 = "FF0000";
	this.render = function(ctx){
		var gradientSize = this.displaySize/4;
		var gradient = ctx.createRadialGradient(this.pos.x-gradientSize,this.pos.y-gradientSize,gradientSize,this.pos.x,this.pos.y,this.displaySize);
		gradient.addColorStop(0,this.color1);
		gradient.addColorStop(0.5,this.color2);
		gradient.addColorStop(1,"rgba(0,0,0,0)");
		fillCircle(ctx,this.pos.x,this.pos.y,this.displaySize,gradient);
	}
	this.calculateForce = function(body){
		var dx = body.pos.x-this.pos.x;
		var dy = body.pos.y-this.pos.y;
		var d = Math.sqrt(dx*dx+dy*dy);
		if(d<gravityDistanceThreshold) return new Vector2(0,0);
		var Fmodified = (this.m*body.m*G)/(d*d*d); //third 'd' is for unit vector
		dx*=Fmodified;
		dy*=Fmodified;
		return new Vector2(dx,dy);
	}
}

function PlayerCharacter(startPosition,fuelCapacity,goalPosition){
	this.startPos = new Vector2(startPosition.x,startPosition.y);
	this.pos = new Vector2(startPosition.x,startPosition.y);
	this.color = "#7777FF";
	this.startColor1 = "#FFF0F0";
	this.startColor2 = "#FFFF00";
	this.goalColor1 = "#F0FFF0";
	this.goalColor2 = "#00FF00";
	this.decisionLineColor = "#0000FF";
	this.idleLineColor = "#FFFFFF";
	this.shipGeometry = new Array(new Vector2(0,5), new Vector2(2.0943951,2), new Vector2(4.1887902,2));
	this.fuelCapacity = fuelCapacity;
	this.goalPos = goalPosition;
	this.distToGoal = Math.sqrt((startPosition.x-goalPosition.x)*(startPosition.x-goalPosition.x)+(startPosition.y-goalPosition.y)*(startPosition.y-goalPosition.y));
	this.bestDistToGoal = Math.sqrt((startPosition.x-goalPosition.x)*(startPosition.x-goalPosition.x)+(startPosition.y-goalPosition.y)*(startPosition.y-goalPosition.y));
	this.fuel = fuelCapacity;
	this.power = 0.00001;
	this.vel = new Vector2(0,0);
	this.unitVel = new Vector2(1,0);
	this.orientation = 0.0;
	this.mass = 0.00000000001;
	this.markerSize = 5;
	this.decisionFrame = false;
	this.decisionArray = new Array(); //Not implemented
	this.turnAccuity = 0.1;
	this.fuelRatio = 100000;
	this.update = function(bodies, dt){
		var netForce = new Vector2(0,0);
		var myGBody = new GBody(this.pos,this.vel,this.mass);
		for(var i = 0; i < bodies.length;i++){
			var f = myGBody.calculateForce(bodies[i]);
			netForce.x += f.x;
			netForce.y += f.y;
		}
		this.vel.x += netForce.x/this.mass*dt;
		this.vel.y += netForce.y/this.mass*dt;
		this.pos.x+=this.vel.x*dt;
		this.pos.y+=this.vel.y*dt;
		this.distToGoal = Math.sqrt((this.pos.x-this.goalPos.x)*(this.pos.x-this.goalPos.x)+(this.pos.y-this.goalPos.y)*(this.pos.y-this.goalPos.y));
		if(this.distToGoal<this.bestDistToGoal) this.bestDistToGoal = this.distToGoal;
	}
	this.render = function(ctx){
		var gradientSize = this.markerSize/4;
		var startGradient = ctx.createRadialGradient(this.startPos.x-gradientSize,this.startPos.y-gradientSize,gradientSize,this.startPos.x,this.startPos.y,this.markerSize);
		startGradient.addColorStop(0,this.startColor1);
		startGradient.addColorStop(0.5,this.startColor2);
		startGradient.addColorStop(1,"rgba(0,0,0,0)");
		
		fillCircle(ctx,this.startPos.x,this.startPos.y,this.markerSize,startGradient);
		
		var goalGradient = ctx.createRadialGradient(this.goalPos.x-gradientSize,this.goalPos.y-gradientSize,gradientSize,this.goalPos.x,this.goalPos.y,this.markerSize);
		goalGradient.addColorStop(0,this.goalColor1);
		goalGradient.addColorStop(0.5,this.goalColor2);
		goalGradient.addColorStop(1,"rgba(0,0,0,0)");
		
		fillCircle(ctx,this.goalPos.x,this.goalPos.y,this.markerSize,goalGradient);
		
		if(this.decisionFrame){
			overlayContext.fillStyle = this.decisionLineColor;
			this.decisionFrame = false;
		}
		else
			overlayContext.fillStyle = this.idleLineColor;
		overlayContext.fillRect(this.pos.x,this.pos.y,1,1);
		
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
	this.thrust = function(power){
		if(this.fuel-Math.abs(power)*this.fuelRatio>=0){
			this.decisionFrame = true;
			this.fuel-=Math.abs(power)*this.fuelRatio;
			this.vel = new Vector2((this.unitVel.x)*power+this.vel.x,(this.unitVel.y)*power+this.vel.y);
		}
	}
	this.turn = function(angle){
		this.orientation = (this.orientation+angle)%(Math.PI*2);
		this.unitVel.x = Math.cos(this.orientation);
		this.unitVel.y = Math.sin(this.orientation);
		
	}
}