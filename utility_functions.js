//Simple select all function which takes an ID, sets it to focused and selects the elements
function SelectAll(id){
	document.getElementById(id).focus();
	document.getElementById(id).select();
}

//Fills a circle given a location, radius, color and context
function fillCircle(ctx,x,y,r,color){
	ctx.fillStyle = color;
	ctx.beginPath();
	ctx.arc(x,y,r, 0, Math.PI*2, true); 
	ctx.closePath();
	ctx.fill();
}

//Rotate one point around another point, angle is in radians
function rotatePoint(rotatingPoint, fixedPoint, angle){
	var s = Math.sin(angle);
	var c = Math.cos(angle);
	
	var p = new Vector2(rotatingPoint.x-fixedPoint.x,rotatingPoint.y-fixedPoint.y);
	var newX = p.x*c - p.y*s;
	var newY = p.x*s + p.y*c;
	
	p.x = newX+fixedPoint.x;
	p.y = newY+fixedPoint.y;
	
	return p;
}

//Get a random number between two values rounded to a certain decimal place
function getRandomRoundedInRange(min,max,roundToDec){
	return parseFloat(((Math.random()*(max-min))+min).toFixed(roundToDec),10);
}

//Synchronize the components which are docked to one another
function SyncDisplayLocations(){
	canvas.style.top = overlayCanvas.style.top;
	canvas.style.left = overlayCanvas.style.left;
	outputDivArea.style.top = canvas.style.top;
	outputDivArea.style.left = parseInt(canvas.style.left,10)+canvas.width;
	inputDivArea.style.top = parseInt(canvas.style.top,10)+canvas.height;
	inputDivArea.style.left = canvas.style.left;
}

//Round a number to a certain interval
function RoundToSignificance(num, sig){
	return Math.round(num/sig)*sig;
}

//Get a unit vector (this most likely should only be called during initializations because although it's as 
//efficient as can be for a single call, it likely contains duplicate calculations which can be reused later).
function getUnitVector(v1,v2){
	var d = Math.sqrt((v1.x-v2.x)*(v1.x-v2.x)+(v1.y-v2.y)*(v1.y-v2.y));
	return new Vector2((v1.x-v2.x)/d,(v1.y-v2.y)/d);
}

var rk4 = function(a,r,v,dt){
	var a0    = a*r;
	var a1    = a*(r + 0.5*dt*v + 0.125*dt*dt*a0);
	var a2    = a*(r +     dt*v + 0.500*dt*dt*a1);
	var new_r =    r +     dt*v + ((a0+2*a1)*dt*dt)/6;
	return {r: new_r, v: v};
}

var euler = function(a,r,v,dt){
	var new_v = v+a*dt;
	var new_r = r+v*dt+0.5*a*dt*dt;
	return {r: new_r, v: new_v}
}

var heun = function(a,r,v,dt){
	//var new_v = v+2*a*dt;
	var new_r = r+2*v*dt;
	return {r: new_r, v: v};
}