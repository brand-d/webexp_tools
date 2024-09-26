// Timer functionality
var _timerCollection = {}

/* Starts a timer with a given name.
 When the timer is already existing:
 - Resets the timer when resetTimer is true
 - Otherwise lets the timer continue (when stopped)
 Note that when continued, the timer not have a sudden "jump" in time,
 but instead continue to measure from that point onwards.
*/
function startTimer(name, resetTimer=true) {
	if(name in _timerCollection && !resetTimer) {
		let timer = _timerCollection[name];
		if(!timer["running"]) {
			timer["running"] = true;
			let newInit = Date.now() - timer["stopped_time"];
			timer["initial_time"] = newInit;
			timer["stopped_time"] = newInit;
		}
	} else {
		let time = Date.now();
		_timerCollection[name] = {
			"running": true,
			"initial_time": time,
			"stopped_time": time
		}
	}
}
/* Continues a stopped timer. If the timer does not
 exist, a new timer is created. */
function continueTimer(name) {
	startTimer(name, resetTimer=false);
}
/* Returns the current reading of the timer
 i.e., the time since it was started (or resetted)
 */
function readTimer(name) {
	if(name in _timerCollection) {
		let timer = _timerCollection[name];
		if(timer["running"])
			return Date.now() - timer["initial_time"];
		else
			return timer["stopped_time"];
	} else {
		return null;
	}
}
/* Stops the timer and returns the respective reading
 Once stopped, the timer will no longer update the reading.
*/
function stopTimer(name) {
	if(name in _timerCollection) {
		let timer = _timerCollection[name];
		if(timer["running"]) {
			timer["running"] = false;
			timer["stopped_time"] = Date.now() - timer["initial_time"];
		}
		return timer["stopped_time"];
	}
	return 0;
}

/* Shuffles a given array.
 Uses the Fisher-Yates shuffle.
 When a set is used as an input, it is 
 automatically converted to an array.
*/
function shuffle(l) {
	if(l instanceof Set) {
		l = Array.from(l);
	}
	else if(!Array.isArray(l)) {
		throw new Error('shuffle: Parameter is neither a set nor an array!');
	}
    let result = l.slice(0);
    let currentIndex = result.length; 
    while (currentIndex > 0) {
        let randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [result[currentIndex], result[randomIndex]] = [result[randomIndex], result[currentIndex]];
    }
    return result;
}

/* Returns the values of all selected inputs with a 
 given name (for type=radio and type=checkbox).
 For radio buttons, the value is returned directly,
 for checkboxes, a list of the selected responses is returned.
*/
function getSelectedInputsByName(name) {
	const inputs = document.getElementsByName(name);
	let selected = [];
	for(let input of inputs) {
		if(input.nodeName == "INPUT") {
			if ((input.getAttribute("type") == "checkbox") && input.checked)
				selected.push(input.value);
			else if ((input.getAttribute("type") == "radio") && input.checked)
				return input.value;		
		}
	}
	return selected;
}
/* Returns the values of all selected inputs from a collection.
 For radio buttons, the value is returned directly,
 for checkboxes, a list of the selected responses is returned.
*/
function getSelectedInputsByName(inputs) {
	let selected = [];
	for(let input of inputs) {
		if(input.nodeName == "INPUT") {
			if ((input.getAttribute("type") == "checkbox") && input.checked)
				selected.push(input.value);
			else if ((input.getAttribute("type") == "radio") && input.checked)
				return input.value;		
		}
	}
	return selected;
}


/* Disables or enables all elements by name or classname. 
 disabled: Specifies if the elements should be disabled (true) or enabled (false).
 name: if not null, it is used to retrieve the affected elements
 classname: if not null, it is used to retrieve the affected elements
 Both name and classname can be used together, but one has to be provided.
*/
function setElementsDisabled(disabled, name=null, classname=null) {
	if((name == null) && (classname == null)) {
		throw new Error('setElementsDisabled: name or classname has to be specified.');
	}
	if(name != null) {
		for(let elem of document.getElementsByName(name)) elem.disabled = disabled;
	}
	if(classname != null) {
		for(let elem of document.getElementsByClassName(classname)) elem.disabled = disabled;
	}
}
/* Disables or enables a loading animation for all elements by name or classname. 
 loading: Specifies if the elements should show a loading animation.
 name: if not null, it is used to retrieve the affected elements
 classname: if not null, it is used to retrieve the affected elements
 Both name and classname can be used together, but one has to be provided.
*/
function setElementsLoading(loading, name=null, classname=null) {
	if((name == null) && (classname == null)) {
		throw new Error('setElementsDisabled: name or classname has to be specified.');
	}
	if(name != null) {
		for(let elem of document.getElementsByName(name)) elem.setAttribute("aria-busy", loading);
	}
	if(classname != null) {
		for(let elem of document.getElementsByClassName(classname)) elem.setAttribute("aria-busy", loading);
	}
}