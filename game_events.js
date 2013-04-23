//Keyboard button pressed
function KeyDownEvent(e){
	instructionMode=false; //Turn off instruction mode
	if(document.activeElement.id=="inputCommandsTextbox") return true; //If we're in the textbox, pass the key event on
	if(e.keyCode==192){ //` key
		if(numericalMethod == euler)
			numericalMethod = heun;
		else if(numericalMethod == heun)
			numericalMethod = rk4;
		else if(numericalMethod == rk4)
			numericalMethod = euler;
		return false;
	}
	keyStates[e.keyCode] = true; //Otherwise, register the key is down
	if(e.keyCode==17||e.keyCode==82) return true; //If it's CTRL+R, pass it on
	return false; //Don't pass it on
}

//Keyboard button depress
function KeyUpEvent(e){
	instructionMode=false; //Turn off instruction mode
	if(document.activeElement.id=="inputCommandsTextbox") return true; //If we're in the textbox, pass the key event on
	keyStates[e.keyCode] = false; //Unregister the key is down
	return false; //Don't pass it on
}

//Process registered keys
function HandleKeyEvents(t){
	HandleShipKeys(t);
	HandleInterfaceKeys(t);
}
var eventLog = new Array();
function HandleShipKeys(t){
	if(keyStates[37]){ //Left Key
		pc.turn(-pc.turnAccuity); //Turn the ship left
		eventLog.push({t: t, e: 37});
	}
	if(keyStates[38]){ //Up Key
		pc.thrust(pc.power); //Apply thrust forward
		eventLog.push({t: t, e: 38});
	}
	if(keyStates[39]){ //Right Key
		pc.turn(pc.turnAccuity); //Turn the ship right
		eventLog.push({t: t, e: 39});
	}
	if(keyStates[40]){ //Down Key
		pc.thrust(-pc.power); //Apply thrust backwards
		eventLog.push({t: t, e: 40});
	}
}

function HandleInterfaceKeys(){
	if(keyStates[27]){ //ESC Key
		instructions.fadeFlag = true; //Fade the instructions
	}
	if(keyStates[82]){ //R Key
		restartFlag = true; //Restart the level
		newLevelFlag = false; //Keep the same level
	}
	if(keyStates[78]){ //N Key
		newLevelFlag = true; //Restart the level
		restartFlag = true; //Generate a new level
	}
}

//If the window is resized and the elements haven't been dragged, reset their locations to center.
function WindowResizeEvent(){
	if(!hasBeenDragged){
		canvas.style.top = (window.innerHeight-canvas.height)/2;
		canvas.style.left = (window.innerWidth-canvas.width)/2;
		overlayCanvas.style.top = canvas.style.top;
		overlayCanvas.style.left = canvas.style.left;
		report.reposition(parseInt(canvas.style.left,10)-reportCanvas.width-boundryPadding,(window.innerHeight-reportCanvas.height)/2);
	}
	
	//Resize Instructions
	instructions.resize(document.body.offsetWidth,document.body.offsetHeight);
	
	//Make sure displays are synced
	SyncDisplayLocations();
}

//If something is dragged, raise the drag flag
function CanvasDragEvent(){
	hasBeenDragged = true;
}