window.onkeydown = KeyDownEvent;
window.onkeyup = KeyUpEvent;
window.onresize = WindowResizeEvent;

function KeyDownEvent(e){
	keyStates[e.keyCode] = true;
	if(e.keyCode==17||e.keyCode==82) return true;
	return false;
}

function KeyUpEvent(e){
	keyStates[e.keyCode] = false;
	return false;
}

function HandleKeyEvents(t){
	if(keyStates[37]){ //Left Key
		pc.turn(-pc.turnAccuity);
	}
	if(keyStates[38]){ //Up Key
		pc.thrust(pc.power);
	}
	if(keyStates[39]){ //Right Key
		pc.turn(pc.turnAccuity);
	}
	if(keyStates[40]){ //Down Key
		pc.thrust(-pc.power);
	}
	if(keyStates[82]){ //R Key
		restartFlag = true;
		newLevelFlag = false;
	}
	if(keyStates[78]){ //N Key
		newLevelFlag = true;
		restartFlag = true;
	}
}

function WindowResizeEvent(){
	if(!hasBeenDragged){
		canvas.style.top = (window.innerHeight-canvas.height)/2;
		canvas.style.left = (window.innerWidth-canvas.width)/2;
		overlayCanvas.style.top = canvas.style.top;
		overlayCanvas.style.left = canvas.style.left;
		reportCanvas.style.top = (window.innerHeight-reportCanvas.height)/2;
		reportCanvas.style.left = parseInt(canvas.style.left,boundryPadding)-reportCanvas.width-boundryPadding;
	}
}

function CanvasDragEvent(){
	hasBeenDragged = true;
}