const continueBtn = document.getElementById("continue_btn");

function continueFunction(e) {
	/* It is good to disable the button and signal to the user that something is 
	   processing. This prevents double clicks, etc on the button. */
	continueBtn.disabled = true;
    continueBtn.setAttribute("aria-busy", "true");
	
	// More for continue btn...
	
	// 
	/* Before continuing, data has (potentially) to be saved on the server.
	This block creates the record to save and sends it to the server.
	Adjust it depending on your needs.
	
	// The person id is optional, but can be very handy to have it in each record.
	let personId = sessionStorage.getItem("personId");

	// Record to save
	let payload = {
		"id": personId,
        "page" : "template_page",
        "page_time" : getCurrentPageTime()
    }
	
	let success = await writeData(payload);
    if(success) {
        goToNextTask();
    }
    else {
        alert("Could not save data. Please contact us for assistance.");
    }
	*/
}

function init() {
	// Only on the first html page of the task: remove it from the tasks list
	// Remove the current task
    //removeCurrentTask();
	
	// Block participants from leaving
    blockLeaving();
	
	// Add a listener to the continue button
	continueBtn.addEventListener("click", continueFunction);
}

window.addEventListener("load", init);