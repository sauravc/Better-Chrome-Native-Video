"use strict";

let videoClass = "chrome-better-HTML5-video";
let directVideoClass = "DIRECT-chrome-better-HTML5-video";

function processAllVideos(){
	if(document.body.children.length == 1  // Handle direct video access
	&& document.body.firstElementChild.tagName.toUpperCase() == "VIDEO"
	&& document.body.firstElementChild.hasAttribute("controls")){
		registerDirectVideo();
	}else{
		let videos = document.getElementsByTagName("video");
		for(let i = 0; i < videos.length; ++i){
			if(videos[i].hasAttribute("controls"))
				registerVideo(videos[i]);
		}
	}
	
	let observer = new MutationObserver(function(mrs){
		for(let i = 0; i < mrs.length; ++i){
			if(mrs[i].type == "attributes" && mrs[i].attributeName == "controls"){
				let t = mrs[i].target;
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
				if(mrs[i].addedNodes) for(let j = 0; j < mrs[i].addedNodes.length; ++j){
					let an = mrs[i].addedNodes[j];
					if(an.tagName && an.tagName.toUpperCase() == "VIDEO"
					&& !an.classList.contains(videoClass)
					&& an.hasAttribute("controls")){
						registerVideo(an);
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
	let vids = document.getElementsByClassName(videoClass);
	for(let i = 0; i < vids.length; ++i){
		unregisterVideo(vids[i]);
	}
	document.body.firstElementChild.classList.add(directVideoClass);
	document.addEventListener("click", directHandleClick);
	document.addEventListener("keydown", directHandleKey);
}

function unregisterDirectVideo(){
	document.removeEventListener("click", directHandleClick);
	document.removeEventListener("keydown", directHandleKey);
	let vids = document.getElementsByClassName(directVideoClass);
	for(let i = 0; i < vids.length; ++i){
		registerVideo(vids[i]);
		vids[i].focus();
		vids[i].classList.remove(directVideoClass);
	}
}

function registerVideo(v){
	v.classList.add(videoClass);
	v.addEventListener("click", handleClick);
	v.addEventListener("keydown", handleKey);
}

function unregisterVideo(v){
	v.classList.remove(videoClass);
	v.removeEventListener("click", handleClick);
	v.removeEventListener("keydown", handleKey);
}

function directHandleClick(e){
	let v = this.body.firstElementChild;
	if(v.paused)
		v.play();
	else
		v.pause();
}

function directHandleKey(e){
	handleKey(e, this.firstElementChild);
}

function handleClick(e){
	if(document.activeElement === this){
		if(this.paused)
			this.play();
		else
			this.pause();
	}else{
		e.preventDefault();
		this.focus();
	}
}

function handleKey(e, v){
	if(v === undefined)
		v = this;
	switch(e.keyCode){
	case 32: // Space
	case 75: // K
		if(v.paused)
			v.play();
		else
			v.pause();
		break;
	case 35: // End
		v.currentTime = v.duration;
		break;
	case 48: // 0
	case 36: // Home
		v.currentTime = 0;
		break;
	case 37: // Left arrow
	case 74: // J
		if(e.shiftKey)
			v.currentTime -= 10;
		else
			v.currentTime -= 5;
		break;
	case 39: // Right arrow
	case 76: // L
		if(e.shiftKey)
			v.currentTime += 10;
		else
			v.currentTime += 5;
		break;
	case 38: // Up arrow
		if(v.volume <= 0.9) v.volume += 0.1;
		break;
	case 40: // Down arrow
		if(v.volume >= 0.1) v.volume -= 0.1;
		break;
	case 70: // F
		if(document.webkitFullscreenElement)
			document.webkitExitFullscreen();
		else
			v.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
		break;
	case 77: // M
		v.muted = !v.muted;
		break;
	case 188: // Comma or Less-Than
		if(e.shiftKey) // Less-Than
			v.playbackRate -= 0.25;
		else // Comma
			v.currentTime -= 1/60;
		break;
	case 190: // Period or Greater-Than
		if(e.shiftKey) // Greater-Than
			v.playbackRate += 0.25;
		else // Period
			v.currentTime += 1/60;
		break;
	case 191: // Forward slash or ?
		if(e.shiftKey) // ?
			v.playbackRate = v.defaultPlaybackRate;
		break;
	default:
		if(e.keyCode >= 49 && e.keyCode <= 57) // 1-9
			v.currentTime = v.duration * (e.keyCode - 48) / 10.0;
		else
			return; // Do not prevent default if no UI activated
	}
	e.preventDefault();
}

if(document.readyState !== "loading")
	processAllVideos();
else
	window.addEventListener("load", processAllVideos);
