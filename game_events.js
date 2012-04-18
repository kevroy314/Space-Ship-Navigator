//Keyboard button pressed
function KeyDownEvent(e){
	instructionMode=false; //Turn off instruction mode
	if(document.activeElement.id=="inputCommandsTextbox") return true; //If we're in the textbox, pass the key event on
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
function HandleKeyEvents(){
	HandleShipKeys();
	HandleInterfaceKeys();
}

function HandleShipKeys(t){
	if(keyStates[37]){ //Left Key
		pc.turn(-pc.turnAccuity); //Turn the ship left
	}
	if(keyStates[38]){ //Up Key
		pc.thrust(pc.power); //Apply thrust forward
	}
	if(keyStates[39]){ //Right Key
		pc.turn(pc.turnAccuity); //Turn the ship right
	}
	if(keyStates[40]){ //Down Key
		pc.thrust(-pc.power); //Apply thrust backwards
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
		reportCanvas.style.top = (window.innerHeight-reportCanvas.height)/2;
		reportCanvas.style.left = parseInt(canvas.style.left,10)-reportCanvas.width-boundryPadding;
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