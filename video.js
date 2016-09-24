"use strict";

const videoClass = "chrome-better-HTML5-video";
const directVideoClass = "DIRECT-chrome-better-HTML5-video";

//// BEGIN SHORTCUT FUNCTIONS ////

function togglePlay(v){
	if(v.paused)
		v.play();
	else
		v.pause();
}

function toStart(v){
	v.currentTime = 0;
}

function toEnd(v){
	v.currentTime = v.duration;
}

function skipLeft(v,e){
	if(e.shiftKey)
		v.currentTime -= 10;
	else
		v.currentTime -= 5;
}

function skipRight(v,e){
	if(e.shiftKey)
		v.currentTime += 10;
	else
		v.currentTime += 5;
}

function increaseVol(v){
	if(v.volume <= 0.9) v.volume += 0.1;
	else v.volume = 1;
}

function decreaseVol(v){
	if(v.volume >= 0.1) v.volume -= 0.1;
	else v.volume = 0;
}

function toggleMute(v){
	v.muted = !v.muted;
}

function toggleFS(v){
	if(document.webkitFullscreenElement)
		document.webkitExitFullscreen();
	else
		v.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
}

function reloadVideo(v){
	const currTime = v.currentTime;
	v.load();
	v.currentTime = currTime;
}

function slowOrPrevFrame(v,e){
	if(e.shiftKey) // Less-Than
		v.playbackRate -= 0.25;
	else // Comma
		v.currentTime -= 1/60;
}

function fastOrNextFrame(v,e){
	if(e.shiftKey) // Greater-Than
		v.playbackRate += 0.25;
	else // Period
		v.currentTime += 1/60;
}

function normalSpeed(v,e){
	if(e.shiftKey) // ?
		v.playbackRate = v.defaultPlaybackRate;
}

function toPercentage(v,e){
	v.currentTime = v.duration * (e.keyCode - 48) / 10.0;
}

//// END SHORTCUT FUNCTIONS ////

const keyFuncs = {
	 32: togglePlay,      // Space
	 75: togglePlay,      // K
	 35: toEnd,           // End
	 48: toStart,         // 0
	 36: toStart,         // Home
	 37: skipLeft,        // Left arrow
	 74: skipLeft,        // J
	 39: skipRight,       // Right arrow
	 76: skipRight,       // L
	 38: increaseVol,     // Up arrow
	 40: decreaseVol,     // Down arrow
	 77: toggleMute,      // M
	 70: toggleFS,        // F
	 82: reloadVideo,     // R
	188: slowOrPrevFrame, // Comma or Less-Than
	190: fastOrNextFrame, // Period or Greater-Than
	191: normalSpeed,     // Forward slash or ?
	 49: toPercentage,    // 1
	 50: toPercentage,    // 2
	 51: toPercentage,    // 3
	 52: toPercentage,    // 4
	 53: toPercentage,    // 5
	 54: toPercentage,    // 6
	 55: toPercentage,    // 7
	 56: toPercentage,    // 8
	 57: toPercentage,    // 9
};

function processAllVideos(){
	if(document.body.children.length == 1 // Handle direct video access
	&& document.body.firstElementChild.tagName.toUpperCase() == "VIDEO"
	&& document.body.firstElementChild.hasAttribute("controls")){
		registerDirectVideo();
	}else{
		const videos = document.getElementsByTagName("video");
		for(let i = 0; i < videos.length; ++i){
			if(videos[i].hasAttribute("controls"))
				registerVideo(videos[i]);
		}
	}
	
	const observer = new MutationObserver(function(mrs){
		for(let i = 0; i < mrs.length; ++i){
			if(mrs[i].type == "attributes" && mrs[i].attributeName == "controls"){
				const t = mrs[i].target;
				if(!t.hasAttribute("controls")){
					if(t.classList.contains(directVideoClass)){
						unregisterDirectVideo();
					}else if(t.classList.contains(videoClass)){
						unregisterVideo(t);
					}
				}else if(t.tagName.toUpperCase() == "VIDEO"){
					if(document.body.children.length == 1
					&& document.body.firstElementChild == t){
						registerDirectVideo();
					}else{
						registerVideo(t);
						t.focus();
					}
				}
			}else{
				// Handle direct video access
				if(document.body.children.length != 1
				|| !document.body.firstElementChild.classList.contains(directVideoClass)
				|| !document.body.firstElementChild.hasAttribute("controls")){
					unregisterDirectVideo();
				}
				if(document.body.children.length == 1
				&& document.body.firstElementChild.tagName.toUpperCase() == "VIDEO"
				&& document.body.firstElementChild.hasAttribute("controls")){
					registerDirectVideo();
				}
				if(mrs[i].addedNodes){
					for(let j = 0; j < mrs[i].addedNodes.length; ++j){
						const an = mrs[i].addedNodes[j];
						if(an.tagName && an.tagName.toUpperCase() == "VIDEO"){
							if(!an.classList.contains(videoClass)
							&& an.hasAttribute("controls"))
								registerVideo(an);
						}else if(an.getElementsByTagName){
							const cn = an.getElementsByTagName("VIDEO");
							for(let k=0;k<cn.length;++k){
								if(!cn[k].classList.contains(videoClass)
								&& cn[k].hasAttribute("controls"))
									registerVideo(cn[k]);
							}
						}
					}
				}
			}
		}
	});
	observer.observe(document.documentElement, {
		childList: true,
		attributes: true,
		attributeFilter: ["controls"],
		subtree: true
	});
}

function registerDirectVideo(){
	const vids = document.getElementsByClassName(videoClass);
	for(let i = 0; i < vids.length; ++i){
		unregisterVideo(vids[i]);
	}
	document.body.firstElementChild.classList.add(directVideoClass);
	document.addEventListener("click", directHandleClick);
	document.addEventListener("keydown", directHandleKeyDown);
	document.addEventListener("keypress", handleKeyUp);
	document.addEventListener("keyup", handleKeyUp);
}

function unregisterDirectVideo(){
	document.removeEventListener("click", directHandleClick);
	document.removeEventListener("keydown", directHandleKeyDown);
	document.removeEventListener("keypress", handleKeyUp);
	document.removeEventListener("keyup", handleKeyUp);
	const vids = document.getElementsByClassName(directVideoClass);
	for(let i = 0; i < vids.length; ++i){
		registerVideo(vids[i]);
		vids[i].focus();
		vids[i].classList.remove(directVideoClass);
	}
}

function registerVideo(v){
	v.classList.add(videoClass);
	v.addEventListener("click", handleClick);
	v.addEventListener("keydown", handleKeyDown);
	v.addEventListener("keypress", handleKeyUp);
	v.addEventListener("keyup", handleKeyUp);
	v.addEventListener("webkitfullscreenchange", handleFullscreen);
}

function unregisterVideo(v){
	v.classList.remove(videoClass);
	v.removeEventListener("click", handleClick);
	v.removeEventListener("keydown", handleKeyDown);
	v.removeEventListener("keypress", handleKeyUp);
	v.removeEventListener("keyup", handleKeyUp);
	v.removeEventListener("webkitfullscreenchange", handleFullscreen);
}

function directHandleClick(e){
	const v = this.body.firstElementChild;
	togglePlay(v);
}

function directHandleKeyDown(e){
	return handleKeyDown(e, this.body.firstElementChild);
}

function handleClick(e){
	if(document.activeElement === this){
		togglePlay(this);
		return true;
	}else{
		this.focus();
		e.preventDefault();
		e.stopPropagation();
		return false
	}
}

function handleKeyDown(e, v){
	if(v === undefined)
		v = this;
	const func = keyFuncs[e.keyCode];
	if(func !== undefined){
		func(v,e);
		e.preventDefault();
		e.stopPropagation();
		return false;
	}
	return true; // Do not prevent default if no UI activated
}

function handleKeyUp(e){
	if(keyFuncs[e.keyCode] !== undefined){
		e.preventDefault();
		e.stopPropagation();
		return false;
	}
	return true; // Do not prevent default if no UI activated
}

function handleFullscreen(){
	if(document.webkitFullscreenElement===this)
		this.focus()
}

if(document.readyState !== "loading")
	processAllVideos();
else
	window.addEventListener("load", processAllVideos);
