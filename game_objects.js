var G = .00000000006673
var gravityDistanceThreshold = 2;

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
			//Labels
			/*ctx.fillStyle = "#FF0000";
			var drawX = this.bodies[i].pos.x;
			if(drawX+10>canvas.width) drawX = canvas.width-10;
			else if (drawX-2<0) drawX = 2;
			var drawY = this.bodies[i].pos.y;
			if(drawY+5>canvas.height) drawY = canvas.height-5;
			if(drawY-10<0) drawY = 10;
			ctx.fillText(""+i,drawX,drawY);*/
		}
	}
}

function fillCircle(ctx,x,y,r,color){
	ctx.fillStyle = color;
	ctx.beginPath();
	ctx.arc(x,y,r, 0, Math.PI*2, true); 
	ctx.closePath();
	ctx.fill();
}

function GBody(Position, Velocity, Mass){
	this.pos = Position;
	this.vel = Velocity;
	this.m = Mass;
	this.displaySize = Math.log(Mass);
	this.render = function(ctx){
		var gradientSize = this.displaySize/4;
		var gradient = ctx.createRadialGradient(this.pos.x-gradientSize,this.pos.y-gradientSize,gradientSize,this.pos.x,this.pos.y,this.displaySize);
		gradient.addColorStop(0,"#FF7000");
		gradient.addColorStop(0.5,"#FF0000");
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

function Vector2(X,Y){
	this.x = X;
	this.y = Y;
}

function PlayerCharacter(startPosition,fuelCapacity,goalPosition){
	this.startPos = new Vector2(startPosition.x,startPosition.y);
	this.pos = new Vector2(startPosition.x,startPosition.y);
	this.color = "#FF0000";
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
	this.decisionArray = new Array();
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
		startGradient.addColorStop(0,"#FFF0F0");
		startGradient.addColorStop(0.5,"#FFFF00");
		startGradient.addColorStop(1,"rgba(0,0,0,0)");
		
		fillCircle(ctx,this.startPos.x,this.startPos.y,this.markerSize,startGradient);
		
		var goalGradient = ctx.createRadialGradient(this.goalPos.x-gradientSize,this.goalPos.y-gradientSize,gradientSize,this.goalPos.x,this.goalPos.y,this.markerSize);
		goalGradient.addColorStop(0,"#F0FFF0");
		goalGradient.addColorStop(0.5,"#00FF00");
		goalGradient.addColorStop(1,"rgba(0,0,0,0)");
		
		fillCircle(ctx,this.goalPos.x,this.goalPos.y,this.markerSize,goalGradient);
		
		if(this.decisionFrame){
			overlayContext.fillStyle = "rgb(0,0,255)";
			this.decisionFrame = false;
		}
		else
			overlayContext.fillStyle = "rgb(255,255,255)";
		overlayContext.fillRect(this.pos.x,this.pos.y,1,1);
		
		ctx.strokeStyle = "#0000FF";
		ctx.lineWidth = 1;
		var startPoint = this.rotatePoint(new Vector2(this.pos.x+this.shipGeometry[0].y,this.pos.y),this.pos,this.orientation+this.shipGeometry[0].x);
		ctx.beginPath();
		ctx.moveTo(startPoint.x,startPoint.y);
		for(var i = 1; i < this.shipGeometry.length;i++){
			var point = this.rotatePoint(new Vector2(this.pos.x+this.shipGeometry[i].y,this.pos.y),this.pos,this.orientation+this.shipGeometry[i].x);
			ctx.lineTo(point.x,point.y);
		}
		ctx.lineTo(startPoint.x,startPoint.y);
		ctx.closePath();
		ctx.stroke();
	}
	this.thrust = function(power){
		if(this.fuel-Math.abs(power)*100000>=0){
			this.decisionFrame = true;
			this.fuel-=Math.abs(power)*100000;
			this.vel = new Vector2((this.unitVel.x)*power+this.vel.x,(this.unitVel.y)*power+this.vel.y);
		}
	}
	this.turn = function(angle){
		this.orientation = (this.orientation+angle)%(Math.PI*2);
		this.unitVel.x = Math.cos(this.orientation);
		this.unitVel.y = Math.sin(this.orientation);
		
	}
	this.rotatePoint = function(rotatingPoint, fixedPoint, angle){
		var s = Math.sin(angle);
		var c = Math.cos(angle);
		
		var p = new Vector2(rotatingPoint.x-fixedPoint.x,rotatingPoint.y-fixedPoint.y);
		var newX = p.x*c - p.y*s;
		var newY = p.x*s + p.y*c;
		
		p.x = newX+fixedPoint.x;
		p.y = newY+fixedPoint.y;
		
		return p;
	}
}