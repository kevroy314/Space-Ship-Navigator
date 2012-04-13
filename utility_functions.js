function SelectAll(id){
	document.getElementById(id).focus();
	document.getElementById(id).select();
}

function fillCircle(ctx,x,y,r,color){
	ctx.fillStyle = color;
	ctx.beginPath();
	ctx.arc(x,y,r, 0, Math.PI*2, true); 
	ctx.closePath();
	ctx.fill();
}

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

function getRandomRoundedInRange(min,max,roundToDec){
	return parseFloat(((Math.random()*(max-min))+min).toFixed(roundToDec),10);
}

function SyncDisplayLocations(){
	canvas.style.top = overlayCanvas.style.top;
	canvas.style.left = overlayCanvas.style.left;
	outputDivArea.style.top = canvas.style.top;
	outputDivArea.style.left = parseInt(canvas.style.left,10)+canvas.width;
	inputDivArea.style.top = parseInt(canvas.style.top,10)+canvas.height;
	inputDivArea.style.left = canvas.style.left;
}

function RoundToSignificance(num, sig){
	return Math.round(num/sig)*sig;
}