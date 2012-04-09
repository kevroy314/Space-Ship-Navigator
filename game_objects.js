var G = .00000000006673

function GBodyField(GBodies){
	this.bodies = GBodies;
	this.update = function(dt){
		for(var i = 0; i < this.bodies.length;i++){
			var netForce = new Vector2(0,0);
			for(var j = 0; j < this.bodies.length;j++){
				if(i!=j){
					var F = this.bodies[i].calculateForce(this.bodies[j]);
					netForce.x+=F.x;
					netForce.y+=F.y;
				}
			}
			this.bodies[i].vel.x+=(netForce.x)*dt;
			this.bodies[i].vel.y+=(netForce.y)*dt;
			this.bodies[i].pos.x+=this.bodies[i].vel.x*dt;
			this.bodies[i].pos.y+=this.bodies[i].vel.y*dt;
		}
	}
	this.render = function(ctx){
		for(var i = 0; i < this.bodies.length;i++)
			this.bodies[i].render(ctx);
	}
}

function GBody(Position, Velocity, Mass){
	this.pos = Position;
	this.vel = Velocity;
	this.m = Mass;
	this.render = function(ctx){
		ctx.fillStyle = "#FFFFFF";
		ctx.beginPath();
		ctx.arc(this.pos.x,this.pos.y,this.m, 0, Math.PI*2, true); 
		ctx.closePath();
		ctx.fill();
	}
	this.calculateForce = function(body){
		var dx = body.pos.x-this.pos.x;
		var dy = body.pos.y-this.pos.y;
		var d = Math.sqrt(dx*dx+dy*dy);
		var top = (body.m*G)/d;
		dx*=top;
		dy*=top;
		return new Vector2(dx,dy);
	}
}

function Vector2(X,Y){
	this.x = X;
	this.y = Y;
}