"use strict";

const form = document.getElementById("form"),
      dblFullScreen = form.elements["dblFullScreen"],
      clickDelay = form.elements["clickDelay"],
      status = document.getElementById("status"),
      saveButton = document.getElementById("save"),
      resetButton = document.getElementById("reset"),
      clearAll1 = document.getElementById("clearAll1"),
      clearAll2 = document.getElementById("clearAll2"),
      clearAll3 = document.getElementById("clearAll3");
const defaults = {
	firstClick:    "focus",
	dblFullScreen: true,
	clickDelay:    0.3,
	skipNormal:    5,
	skipShift:     10,
	skipCtrl:      1,
};

dblFullScreen.onchange = function() {
	setDisabled(clickDelay, !dblFullScreen.checked);
}

function setDisabled(input, disabled) {
	input.disabled = disabled;
	if (input.itemParent ||
	   (input.itemParent = input.closest(".item"))) {
		input.itemParent.classList[disabled ? "add" : "remove"]("disabled");
	}
}

let statusFadeTimeout;
function statusFade() {
	status.classList.add("fade");
	statusFadeTimeout = undefined;
}
function setStatus(text, look, neverFade) {
	if (statusFadeTimeout) {
		clearTimeout(statusFadeTimeout);
	}
	status.innerHTML = text;
	status.className = look;
	if (!neverFade) {
		statusFadeTimeout = setTimeout(statusFade, 5000);
	}
}

function showValues(values) {
	for (let key in values) {
		const e = form.elements[key];
		if (e.type === "checkbox") {
			e.checked = values[key];
		} else {
			e.value = values[key];
		}
		e.onchange && e.onchange();
	}
}

function sendValues(values) {
	const mess = {updatedSettings: values};
	chrome.tabs.query({}, function(tabs) {
		for (let i = tabs.length - 1; i >= 0; --i) {
			chrome.tabs.sendMessage(tabs[i].id, mess);
		}
	});
}

saveButton.onclick = function() {
	const values = {};
	for (let key in defaults) {
		const e = form.elements[key];
		switch (e.type) {
		case "checkbox":
			values[key] = e.checked;
			break;
		case "number":
			values[key] = +e.value;
			break;
		default:
			values[key] = e.value;
			break;
		}
	}
	form.disabled = true;
	setStatus("Saving...", "wait", true);
	chrome.storage.sync.set(values, function() {
		form.disabled = false;
		if (chrome.runtime.lastError) {
			const mess = chrome.runtime.lastError.message;
			if (mess) {
				setStatus("Error while saving settings:<br/>",
					"bad", true);
				status.appendChild(document.createTextNode(mess));
			} else {
				setStatus("Error while saving settings!", "bad");
			}
		} else {
			setStatus("Saved settings.", "good");
		}
	});
	sendValues(values);
}

resetButton.onclick = function() {
	showValues(defaults);
	setStatus("Defaults restored, but NOT SAVED!", "wait", true);
}

clearAll1.onclick = function() {
	clearAll1.classList.add("crossed");
	clearAll2.hidden = false;
}
clearAll2.onclick = function() {
	clearAll2.classList.add("crossed");
	clearAll3.hidden = false;
}
clearAll3.onclick = function() {
	clearAll3.classList.add("crossed");
	form.disabled = true;
	setStatus("Clearing...", "wait", true);
	chrome.storage.sync.clear(function() {
		clearAll1.classList.remove("crossed");
		clearAll2.classList.remove("crossed");
		clearAll3.classList.remove("crossed");
		clearAll2.hidden = clearAll3.hidden = true;
		showValues(defaults);
		form.disabled = false;
		if (chrome.runtime.lastError) {
			const mess = chrome.runtime.lastError.message;
			if (mess) {
				setStatus("Error while clearing settings:<br/>",
					"bad", true);
				status.appendChild(document.createTextNode(mess));
			} else {
				setStatus("Error while clearing settings!", "bad");
			}
		} else {
			setStatus("Deleted all settings.", "good");
		}
	});
	sendValues(defaults);
}

chrome.storage.sync.get(defaults, function(values) {
	if (values) {
		showValues(values);
		setStatus("Loaded settings.", "good");
	} else {
		setStatus("Could not load settings!", "bad");
	}
	if (chrome.runtime.lastError) {
		const mess = chrome.runtime.lastError.message;
		if (mess) {
			setStatus("Error while loading settings:<br/>",
				"bad", true);
			status.appendChild(document.createTextNode(mess));
		} else {
			setStatus("Error while loading settings!", "bad");
		}
	}
	form.disabled = false;
});
