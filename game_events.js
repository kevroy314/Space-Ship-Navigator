//Set up events
window.onkeydown = KeyDownEvent; //When we press a key down, call the KeyDownEvent function (sets keyStates flags)
window.onkeyup = KeyUpEvent; //When we release a key, call the KeyUpEvent function (resets keyStates flags)
window.onresize = WindowResizeEvent; //When we resize the window, call the WindowResizeEvent function (auto-center if not manually moved)

//This function handles the key being pressed down. It modifies the keyStates array and watches for continuous
//time travel requests (this is performed via a "dead man's switch" which must be held to continue travelling
//back in time). It blocks the keyboard events from being passed along to the browser.
function KeyDownEvent(e){
	keyStates[e.keyCode] = true;
	if(e.keyCode==17||e.keyCode==82) return true;
	return false;
}

//This function handles the key being released. It modifies the keyStates array and watches for the release
//of the continuous time travel request. It blocks the keyboard events from being passed along to the browser.
function KeyUpEvent(e){
	keyStates[e.keyCode] = false;
	return false;
}

//This function handles key events which trigger while a key is depressed.
function HandleKeyEvents(t){
	if(keyStates[37]){ //Left Key
	}
	if(keyStates[38]){ //Up Key
		timeStep+=100;
	}
	if(keyStates[39]){ //Right Key
	}
	if(keyStates[40]){ //Down Key
		timeStep-=100;
	}
}

//This function centeres the canvas if it has not been dragged (triggered when the window resizes)
function WindowResizeEvent(){
	if(!hasBeenDragged){
		canvas.style.top = (window.innerHeight-canvas.height)/2;
		canvas.style.left = (window.innerWidth-canvas.width)/2;
		reportCanvas.style.top = (window.innerHeight-reportCanvas.height)/2;
		reportCanvas.style.left = parseInt(mainCanvas.style.left)-reportCanvas.width-50;
	}
}

//This function watches for if the canvas is dragged and sets a flag saying it has which prevents it from being
//auto-centered later.
function CanvasDragEvent(){
	hasBeenDragged = true;
}