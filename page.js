"use strict";

const videoClass = "chrome-better-HTML5-video";
const directVideoClass = "DIRECT-chrome-better-HTML5-video";

const shortcutFuncs = {
	togglePlay: function(v){
		if(v.paused)
			v.play();
		else
			v.pause();
	}

	toStart: function(v){
		v.currentTime = 0;
	}

	toEnd: function(v){
		v.currentTime = v.duration;
	}

	skipLeft: function(v,e){
		if(e.shiftKey)
			v.currentTime -= 10;
		else
			v.currentTime -= 5;
	}

	skipRight: function(v,e){
		if(e.shiftKey)
			v.currentTime += 10;
		else
			v.currentTime += 5;
	}

	increaseVol: function(v){
		if(v.volume <= 0.9) v.volume += 0.1;
		else v.volume = 1;
	}

	decreaseVol: function(v){
		if(v.volume >= 0.1) v.volume -= 0.1;
		else v.volume = 0;
	}

	toggleMute: function(v){
		v.muted = !v.muted;
	}

	toggleFS: function(v){
		if(document.webkitFullscreenElement)
			document.webkitExitFullscreen();
		else
			v.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
	}

	reloadVideo: function(v){
		const currTime = v.currentTime;
		v.load();
		v.currentTime = currTime;
	}

	slowOrPrevFrame: function(v,e){
		if(e.shiftKey) // Less-Than
			v.playbackRate -= 0.25;
		else // Comma
			v.currentTime -= 1/60;
	}

	fastOrNextFrame: function(v,e){
		if(e.shiftKey) // Greater-Than
			v.playbackRate += 0.25;
		else // Period
			v.currentTime += 1/60;
	}

	normalSpeed: function(v,e){
		if(e.shiftKey) // ?
			v.playbackRate = v.defaultPlaybackRate;
	}

	toPercentage: function(v,e){
		v.currentTime = v.duration * (e.keyCode - 48) / 10.0;
	}
}

const keyFuncs = {
	 32: shortcutFuncs.togglePlay,      // Space
	 75: shortcutFuncs.togglePlay,      // K
	 35: shortcutFuncs.toEnd,           // End
	 48: shortcutFuncs.toStart,         // 0
	 36: shortcutFuncs.toStart,         // Home
	 37: shortcutFuncs.skipLeft,        // Left arrow
	 74: shortcutFuncs.skipLeft,        // J
	 39: shortcutFuncs.skipRight,       // Right arrow
	 76: shortcutFuncs.skipRight,       // L
	 38: shortcutFuncs.increaseVol,     // Up arrow
	 40: shortcutFuncs.decreaseVol,     // Down arrow
	 77: shortcutFuncs.toggleMute,      // M
	 70: shortcutFuncs.toggleFS,        // F
	 82: shortcutFuncs.reloadVideo,     // R
	188: shortcutFuncs.slowOrPrevFrame, // Comma or Less-Than
	190: shortcutFuncs.fastOrNextFrame, // Period or Greater-Than
	191: shortcutFuncs.normalSpeed,     // Forward slash or ?
	 49: shortcutFuncs.toPercentage,    // 1
	 50: shortcutFuncs.toPercentage,    // 2
	 51: shortcutFuncs.toPercentage,    // 3
	 52: shortcutFuncs.toPercentage,    // 4
	 53: shortcutFuncs.toPercentage,    // 5
	 54: shortcutFuncs.toPercentage,    // 6
	 55: shortcutFuncs.toPercentage,    // 7
	 56: shortcutFuncs.toPercentage,    // 8
	 57: shortcutFuncs.toPercentage,    // 9
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
