// Holds the time the user left the page/tab
var totalTimeOutsideStudy = 0;

// Default time when page is loaded
var pageStartTime = Date.now();

// Get the current page time
function getCurrentPageTime() {
	return Date.now() - pageStartTime;
}

// Timeout specification
const timeoutDuration = 10000;
const retryDelay = 5000;
const maxNumRetries = 20;
var numRetries = 10;

// Variable for controling if the page can be left
// If false, a warning "should" (depending on browser settings) be shown
var _leavePageAllowed = true;

// Use this function to change the current URL/page
// e.g., changePage("http://www.google.de");
function changePage(targetLocation) {
	_leavePageAllowed = true;
	window.location.replace(targetLocation);
}

// The following code tries to prevent the back-button from working
// However, it is not planned by the browser that this works reliably
window.history.pushState(null, document.title, location.href);
window.addEventListener('popstate', function (event)
{
  window.history.pushState(null, document.title, location.href);
});

// Try to prevent user from leaving the page by showing a warning
// The text is usually ignored and replaced by a browser standard
window.addEventListener('beforeunload', (event) => {
	if(!_leavePageAllowed) {
		event.preventDefault();
		return false;
	}
});

// Starts preventing participants from leaving the page
function blockLeaving() {
    _leavePageAllowed = false;
}

// Allows participants to leave the page
function allowLeaving() {
    _leavePageAllowed = true;
}

// Extracts the Participant ID from the URL.
// Per default, it is called "PROLIFIC_PID"
// If successful, the ID is returned. Otherwise, null is returned
function getParticipantId(paramName='PROLIFIC_PID') {
	let queryString = window.location.search;
	let urlParams = new URLSearchParams(queryString);
	let givenUid = null;
	if(urlParams.has(paramName)) {
		givenUid = urlParams.get(paramName);
	}
	return givenUid;
}

// Creates a new file for a person. 
// If given (i.e., the PROLIFIC_PID), the file will be named like that.
// If no personId given, a random identifier will be generated.
// In both cases, the sessionStorage entry for personId will hold the correct identifier.
async function createFileForPerson(personId=null, phpPath='common/storage/create_person.php', newCall=true) {
	if(newCall) numRetries = maxNumRetries;
    try {
        if(personId == null) {
            return await retrieveId(phpPath);
        } else {
            return await prepareData(personId, phpPath);
        }
    } catch(err) {
        // Retry handling
        console.error(`Error: ${err.name}, message: ${err.message}`);
        numRetries -= 1;
        if(numRetries > 0) {
            console.info(`Retrying in ${retryDelay}ms`);
            await new Promise(r => setTimeout(r, retryDelay));
            return await createFileForPerson(personId=personId, phpPath=phpPath, newCall=false);
        } else {
            return false;
        }
    }
}
// Creates a new file with a random name
async function retrieveId(phpPath) {
    const serverResponse = await fetch(phpPath, {signal: AbortSignal.timeout(timeoutDuration)});
    if(!serverResponse.ok) {
        console.error("Could not reach server");
        return false;
    }
    const data = await serverResponse.json();
    if(data == 0) {
        console.error("Could not create ID");
        return false;
    }
    console.log("Created new file for person without ID: ", data);
    sessionStorage.setItem("personId", data);
    return true;
}

// Creates a new file with a given name
async function prepareData(name, phpPath) {
	let call = `${phpPath}?id=${name}`;
    let serverResponse = await fetch(call);

    if(!serverResponse.ok) {
        console.error("Could not reach server");
        return false;
    }
    let data = await serverResponse.json();
    if(data == 0) {
        console.error("Could not create ID");
        return false;
    }
    console.log("Created new file for person without ID: ", data);
	sessionStorage.setItem("personId", data);
    return true;
}

// Saves a given payload and returns true iff successful.
// If no personId is given (null), then the personId from sessionStorage is used.
// Please check if the php-path is correct relative to the html file
async function writeData(payload, personId=null, phpPath='../../common/storage/save_data.php', newCall=true) {
    if(personId == null) {
        personId = sessionStorage.getItem("personId");
    }
    if (personId == null) {
        console.error('No person ID found');
        return false;
    }

    let storagePath = `${phpPath}?id=${personId}`;
	if(newCall) numRetries = maxNumRetries;
    try {
        const serverResponse = await fetch(storagePath, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
            signal: AbortSignal.timeout(timeoutDuration)
        });
        if(!serverResponse.ok) {
            console.error("Could not reach server");
            return false;
        }
        const data = await serverResponse.json();
        if(data) return true;
        return false;
    } catch(err) {
        // Retry handling
        console.error(`Error: ${err.name}, message: ${err.message}`);
        numRetries -= 1;
        if(numRetries > 0) {
            console.info(`Retrying in ${retryDelay}ms`);
            await new Promise(r => setTimeout(r, retryDelay));
            return await writeData(payload=payload, personId=personId, phpPath=phpPath, newCall=false);
        } else {
            return false;
        }
    }
}

// Retrieves the next task
function getNextTaskUrl() {
    let tasks = sessionStorage.getItem("exp_tasks");
    if(tasks == null) {
        return null;
    }
    tasks = JSON.parse(tasks);
    return tasks[0];
}

// Navigates to the next task
function goToNextTask() {
    let next = getNextTaskUrl();
    if(next == null) {
        console.error("No task found.");
        return;
    }
    let currentBaseUrl = sessionStorage.getItem("base_url");
    if(currentBaseUrl == null) {
        console.error("Cannot retrieve base URL");
        return;
    }
    let nextUrl = currentBaseUrl + next;
    changePage(nextUrl);
}

/* Removes the current task from the stack if possible.
	When the current task is not matching the URL,
	it is only removed when forceDelete is set to true.
*/
function removeCurrentTask(forceDelete=false) {
    
    let tasks = sessionStorage.getItem("exp_tasks");
    if(tasks == null) {
        console.warn("No tasks found in session storage");
        return;
    }
    tasks = JSON.parse(tasks);
	
    // Unprecise test, but usually sufficient:
    // is the task present in the current URL
	const queryString = window.location.pathname;
    if(forceDelete || queryString.includes(tasks[0])) {
        tasks.shift();
        sessionStorage.setItem("exp_tasks", JSON.stringify(tasks));
    }
    else {
        console.warn("Current URL does not seem to correspond to the scheduled task");
        return;
    }
}

// Returns the current tasks list
function getRemainingTasksList() {
	let tasks = sessionStorage.getItem("exp_tasks");
	if(tasks == null) {
        console.warn("No tasks found in session storage");
        return null;
    }
	return tasks;
}

// Overwrites the current task list
function overwriteTasksList(newTasks) {
	if(!Array.isArray(newTasks)) {
		throw new Error('overwriteTasksList: New task list needs to be an array.');
	}
	if(newTasks.length == 0) {
		throw new Error('overwriteTasksList: New task list cannot be empty.');
	}
	sessionStorage.setItem("exp_tasks", JSON.stringify(tasks));
}

// Stores current URL
function storeCurrentUrl() {
    let origin = window.location.origin;
    let pathname = window.location.pathname;
    let currentUrl = origin + pathname.slice(0, pathname.lastIndexOf('/') + 1);
    sessionStorage.setItem("base_url", currentUrl);
    console.info("Set base URL to ", currentUrl);
}

// Get the current specification
function getStudySpecification() {
	const specification = sessionStorage.getItem("exp_specification");
    if(specification == null) {
        return "main";
    } else {
		return specification;
	}
}

// Get the time spend outside the page
function getTotalTimeOutsideStudy() {
	return totalTimeOutsideStudy;
}

// Events for tracking times
var _lastTimeLeft = 0;
window.addEventListener("blur", function() {
	_lastTimeLeft = Date.now();
}); 
window.addEventListener("focus", function() {
	totalTimeOutsideStudy += Date.now() - _lastTimeLeft;
});
window.addEventListener("load", function() {
    pageStartTime = Date.now();
})

// Get return links
function getCompletionUrl() {
	const url = sessionStorage.getItem("exp_completion_url");
    if(url == null) return null;
    else return url;
}
function getRejectUrl() {
	const url = sessionStorage.getItem("exp_reject_url");
    if(url == null) return null;
    else return url;
}
