"use strict";

const videoClass = "chrome-better-HTML5-video",
      directVideoClass = "DIRECT-chrome-better-HTML5-video",
      ignoreVideoClass = "IGNORE-chrome-better-HTML5-video";

var toggleChecked, toggleEnabled, observer, dirVideo, regVideos = [];

const shortcutFuncs = {
	togglePlay: function(v){
		if(v.paused)
			v.play();
		else
			v.pause();
	},

	toStart: function(v){
		v.currentTime = 0;
	},

	toEnd: function(v){
		v.currentTime = v.duration;
	},

	skipLeft: function(v,key,shift,ctrl){
		if(shift)
			v.currentTime -= 10;
		else if(ctrl)
			v.currentTime -= 1;
		else
			v.currentTime -= 5;
	},

	skipRight: function(v,key,shift,ctrl){
		if(shift)
			v.currentTime += 10;
		else if(ctrl)
			v.currentTime += 1;
		else
			v.currentTime += 5;
	},

	increaseVol: function(v){
		if(v.volume <= 0.9) v.volume += 0.1;
		else v.volume = 1;
	},

	decreaseVol: function(v){
		if(v.volume >= 0.1) v.volume -= 0.1;
		else v.volume = 0;
	},

	toggleMute: function(v){
		v.muted = !v.muted;
	},

	toggleFS: function(v){
		if(document.webkitFullscreenElement)
			document.webkitExitFullscreen();
		else
			v.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
	},

	reloadVideo: function(v){
		const currTime = v.currentTime;
		v.load();
		v.currentTime = currTime;
	},

	slowOrPrevFrame: function(v,key,shift){
		if(shift) // Less-Than
			v.playbackRate -= 0.25;
		else // Comma
			v.currentTime -= 1/60;
	},

	fastOrNextFrame: function(v,key,shift){
		if(shift) // Greater-Than
			v.playbackRate += 0.25;
		else // Period
			v.currentTime += 1/60;
	},

	normalSpeed: function(v,key,shift){
		if(shift) // ?
			v.playbackRate = v.defaultPlaybackRate;
	},

	toPercentage: function(v,key){
		v.currentTime = v.duration * (key - 48) / 10.0;
	}
};

const keyFuncs = {
	32 : shortcutFuncs.togglePlay,      // Space
	75 : shortcutFuncs.togglePlay,      // K
	35 : shortcutFuncs.toEnd,           // End
	48 : shortcutFuncs.toStart,         // 0
	36 : shortcutFuncs.toStart,         // Home
	37 : shortcutFuncs.skipLeft,        // Left arrow
	74 : shortcutFuncs.skipLeft,        // J
	39 : shortcutFuncs.skipRight,       // Right arrow
	76 : shortcutFuncs.skipRight,       // L
	38 : shortcutFuncs.increaseVol,     // Up arrow
	40 : shortcutFuncs.decreaseVol,     // Down arrow
	77 : shortcutFuncs.toggleMute,      // M
	70 : shortcutFuncs.toggleFS,        // F
	82 : shortcutFuncs.reloadVideo,     // R
	188: shortcutFuncs.slowOrPrevFrame, // Comma or Less-Than
	190: shortcutFuncs.fastOrNextFrame, // Period or Greater-Than
	191: shortcutFuncs.normalSpeed,     // Forward slash or ?
	49 : shortcutFuncs.toPercentage,    // 1
	50 : shortcutFuncs.toPercentage,    // 2
	51 : shortcutFuncs.toPercentage,    // 3
	52 : shortcutFuncs.toPercentage,    // 4
	53 : shortcutFuncs.toPercentage,    // 5
	54 : shortcutFuncs.toPercentage,    // 6
	55 : shortcutFuncs.toPercentage,    // 7
	56 : shortcutFuncs.toPercentage,    // 8
	57 : shortcutFuncs.toPercentage,    // 9
};

function registerDirectVideo(v){
	unregisterAllVideos();
	if(dirVideo){
		unregisterDirectVideo(v !== dirVideo);
	}
	dirVideo = v;
	v.classList.add(directVideoClass);
	document.addEventListener("click", directHandleClick);
	document.addEventListener("keydown", directHandleKeyDown);
	document.addEventListener("keypress", handleKeyOther);
	document.addEventListener("keyup", handleKeyOther);
}

function unregisterDirectVideo(reregister){
	document.removeEventListener("click", directHandleClick);
	document.removeEventListener("keydown", directHandleKeyDown);
	document.removeEventListener("keypress", handleKeyOther);
	document.removeEventListener("keyup", handleKeyOther);
	dirVideo.classList.remove(directVideoClass);
	if(reregister && document.body.contains(dirVideo)){
		registerVideo(dirVideo);
		dirVideo.focus();
	}
	dirVideo = undefined;
}

function registerVideo(v){
	regVideos.push(v);
	v.classList.add(videoClass);
	v.addEventListener("click", handleClick);
	v.addEventListener("keydown", handleKeyDown);
	v.addEventListener("keypress", handleKeyOther);
	v.addEventListener("keyup", handleKeyOther);
}

function unregisterVideo(v){
	regVideos.splice(regVideos.indexOf(v), 1);
	v.classList.remove(videoClass);
	v.removeEventListener("click", handleClick);
	v.removeEventListener("keydown", handleKeyDown);
	v.removeEventListener("keypress", handleKeyOther);
	v.removeEventListener("keyup", handleKeyOther);
}

function registerAllValidVideos(vs){
	for(let i = 0; i < vs.length; ++i){
		if(vs[i].hasAttribute("controls")
		&&!vs[i].classList.contains(videoClass)
		&&!vs[i].classList.contains(ignoreVideoClass))
			registerVideo(vs[i]);
	}
}

function unregisterAllVideos(){
	for(let i = 0; i < regVideos.length; ++i){
		const v = regVideos[i];
		v.classList.remove(videoClass);
		v.removeEventListener("click", handleClick);
		v.removeEventListener("keydown", handleKeyDown);
		v.removeEventListener("keypress", handleKeyOther);
		v.removeEventListener("keyup", handleKeyOther);
	}
	regVideos = [];
}

function directHandleClick(e){
	shortcutFuncs.togglePlay(dirVideo);
}

function directHandleKeyDown(e){
	return handleKeyDown(e, dirVideo);
}

function handleClick(e){
	if(document.activeElement === this){
		shortcutFuncs.togglePlay(this);
		return true;
	}else{
		this.focus();
		e.preventDefault();
		e.stopPropagation();
		return false
	}
}

function handleKeyDown(e, v){
	if(e.altKey || e.metaKey){
		return true; // Do not activate
	}
	const func = keyFuncs[e.keyCode];
	if(func){
		if((func.length < 3 && e.shiftKey) ||
		   (func.length < 4 && e.ctrlKey)){
			return true; // Do not activate
		}
		func(v || this, e.keyCode, e.shiftKey, e.ctrlKey);
		e.preventDefault();
		e.stopPropagation();
		return false;
	}
	return true; // Do not prevent default if no UI activated
}

function handleKeyOther(e){
	if(e.altKey || e.metaKey){
		return true; // Do not prevent default
	}
	const func = keyFuncs[e.keyCode];
	if(func){
		if((func.length < 3 && e.shiftKey) ||
		   (func.length < 4 && e.ctrlKey)){
			return true; // Do not prevent default
		}
		e.preventDefault();
		e.stopPropagation();
		return false;
	}
	return true; // Do not prevent default if no UI activated
}

function handleFullscreen(){
	if(document.webkitFullscreenElement
	&& document.webkitFullscreenElement.classList.contains(videoClass))
		document.webkitFullscreenElement.focus()
}

function updateContextTarget(e){
	if(e.target && e.target.tagName && e.target.tagName.toLowerCase() === 'video'){
		let target  = e.target,
		    checked = target.classList.contains(ignoreVideoClass),
		    enabled = target.hasAttribute('controls');
		if(toggleChecked !== checked || toggleEnabled !== enabled){
			chrome.runtime.sendMessage({
				toggleChecked: checked,
				toggleEnabled: enabled
			}, function(response) {
				if(!response){
					console.log("Error while connecting:",
						chrome.runtime.lastError.message);
					return;
				}
				if(response.clicked){
					if(response.ignoreVideo){
						if(target.classList.contains(directVideoClass)){
							unregisterDirectVideo(false);
						}
						if(target.classList.contains(videoClass)){
							unregisterVideo(target);
						}
						target.classList.add(ignoreVideoClass);
					}else{
						target.classList.remove(ignoreVideoClass);
						if(target.hasAttribute("controls")){
							if(document.body.children.length === 1
							&& document.body.firstElementChild === target){
								registerDirectVideo(target);
							}else{
								registerVideo(target);
							}
						}
					}
				}
			});
			toggleChecked = checked;
			toggleEnabled = enabled;
		}
	}
}

function handleMutationRecords(mrs){
	for(let i = 0; i < mrs.length; ++i){
		if(mrs[i].type === "attributes" && mrs[i].attributeName === "controls"){
			const t = mrs[i].target;
			if(!t.hasAttribute("controls")){
				if(t.classList.contains(directVideoClass)){
					unregisterDirectVideo(false);
				}else if(t.classList.contains(videoClass)){
					unregisterVideo(t);
				}
			}else if(t.tagName.toLowerCase() === "video"
			&&      !t.classList.contains(ignoreVideoClass)){
				if(document.body.children.length === 1
				&& document.body.firstElementChild === t){
					registerDirectVideo(t);
				}else{
					registerVideo(t);
					t.focus();
				}
			}
		}else if(mrs[i].type === "childList"){
			// Handle direct video access
			if(dirVideo && (document.body.children.length !== 1
			|| document.body.firstElementChild !== dirVideo)){
				unregisterDirectVideo(true);
			}
			if(document.body.children.length === 1
			&& document.body.firstElementChild.tagName.toLowerCase() === "video"
			&& document.body.firstElementChild.hasAttribute("controls")
			&&!document.body.firstElementChild.classList.contains(ignoreVideoClass)
			&&!document.body.firstElementChild.classList.contains(directVideoClass)){
				registerDirectVideo(document.body.firstElementChild);
			}else if(mrs[i].addedNodes){
				for(let j = 0; j < mrs[i].addedNodes.length; ++j){
					const an = mrs[i].addedNodes[j];
					if(an.tagName && an.tagName.toLowerCase() === "video"){
						if(an.hasAttribute("controls")
						&&!an.classList.contains(videoClass)
						&&!an.classList.contains(ignoreVideoClass))
							registerVideo(an);
					}else if(an.getElementsByTagName){
						registerAllValidVideos(an.getElementsByTagName("video"));
					}
				}
			}
			if(mrs[i].removedNodes){
				for(let j = 0; j < mrs[i].removedNodes.length; ++j){
					const rn = mrs[i].removedNodes[j];
					if(rn.classList){
						if(rn.classList.contains(videoClass)){
							unregisterVideo(rn);
						}else if(rn.classList.contains(directVideoClass)){
							unregisterDirectVideo(false);
						}
					}
				}
			}
		}
	}
}

function enableExtension(){
	document.addEventListener("webkitfullscreenchange", handleFullscreen);
	document.addEventListener("mouseover", updateContextTarget);
	document.addEventListener("mousedown", updateContextTarget);
	document.addEventListener("contextmenu", updateContextTarget);
	
	if(document.body.children.length === 1 // Handle direct video access
	&& document.body.firstElementChild.tagName.toLowerCase() === "video"
	&& document.body.firstElementChild.hasAttribute("controls")
	&&!document.body.firstElementChild.classList.contains(ignoreVideoClass)){
		registerDirectVideo(document.body.firstElementChild);
	}else{
		registerAllValidVideos(document.getElementsByTagName("video"));
	}
	
	observer = observer || new MutationObserver(handleMutationRecords);
	observer.observe(document.documentElement, {
		childList: true,
		attributes: true,
		attributeFilter: ["controls"],
		subtree: true
	});
}

function  disableExtension(){
	document.removeEventListener("webkitfullscreenchange", handleFullscreen);
	document.removeEventListener("mouseover", updateContextTarget);
	document.removeEventListener("mousedown", updateContextTarget);
	document.removeEventListener("contextmenu", updateContextTarget);
	
	if(dirVideo) unregisterDirectVideo(false);
	unregisterAllVideos();
	
	if(observer) observer.disconnect();
}

if(document.readyState !== "loading")
	enableExtension();
else
	window.addEventListener("load", enableExtension);
