const continueBtn = document.getElementById("continue_btn");

var currentQuestion = 1;
var presentationStartTime = Date.now();

function showNextTask() {
	// Hide old task div and make the response box disabled
    document.getElementById(`crt_div_${currentQuestion}`).hidden = true;
    if(currentQuestion < 7) {
		const oldQuestionField = document.getElementById(`crt${currentQuestion}`);
        oldQuestionField.disabled = true;
		oldQuestionField.blur();
    }
	
	// Proceed with the next task
    currentQuestion += 1;
	
	// Make the respective box visible
    if(currentQuestion <= 7) {
        document.getElementById(`crt_div_${currentQuestion}`).hidden = false;
		
		// Stop loading throbber
        continueBtn.setAttribute("aria-busy", "false");
		
		// Start the timer for the next question
		startTimer(currentQuestion);
    }
	// Proceed with the next task when all 7 tasks are finished
    else {
        goToNextTask();
    }
}

// Enable/Disable the continue button based on the input fields
function numberInputChanged(e) {
	continueBtn.disabled = e.target.value.length == 0;
}

// Make the continue button enabled when a radio button is selected
function clickedRadioButton(e) {
	// This is sufficient, since the radio button cannot be deselected
    continueBtn.disabled = false;
}

// Blocks the scroll wheel for number inputs
function noScrollWheel(e) {
    e.preventDefault();
}

window.addEventListener("load", function() {
    // Remove the current task at the beginning
    removeCurrentTask();
    
    // Block participants from leaving
    blockLeaving();

	// Add listener for all input fields
    for(let numInput of document.getElementsByClassName("crt_number_input")) {
		// Checks, if the continue button should be enabled
        numInput.addEventListener("input", numberInputChanged);
		
		// Blocks the mouse scroll wheel to mess with number inputs
        numInput.addEventListener("wheel", noScrollWheel);
    }
	
	// Add listener to the radio buttons of the final question
    for(let radioBtn of document.getElementsByName("crt7")) {
		// Checks, if the continue button should be enabled
        radioBtn.addEventListener("input", clickedRadioButton);
    }
	
	// Continue button functionality:
	// - Saves response
	// - Proceeds with next question
    continueBtn.addEventListener("click", async function() {
		// Disable button while waiting for server
        continueBtn.disabled = true;
		
		// Show "busy" throbber
        continueBtn.setAttribute("aria-busy", "true");

		// Collect the current response
        let response = null;
        if(currentQuestion < 7) {
            let currentInput = document.getElementById(`crt${currentQuestion}`);
            currentInput.disabled = true;
            response = parseFloat(currentInput.value);
        } else if(currentQuestion == 7) {
			// Get the selected value
			response = getSelectedInputsByName("crt7");
			
			// Disable the radio buttons while saving
			setElementsDisabled(true, name="crt7");
			
			/* If not done with utils, the code would look like this:
            for(let radioBtn of document.getElementsByName("crt7")) {
                if(radioBtn.checked) response = radioBtn.value;
                radioBtn.disabled = true;
            } 
			The utils are completely optional, but reduce the amount of
			visible loops. However, always use what you believe makes
			it easier to understand the code.
			*/
        }
		
		/* Also save the question text, which has to be cleaned up to not mess
		   with the CSV encoding */
        let questionText = document.getElementById(`crt${currentQuestion}_text`).textContent;
        questionText = questionText.replaceAll(";", ",").replaceAll("\n", " ").trim();
		
		// Although redundant, it can be helpful to have the person ID in each record
        let personId = sessionStorage.getItem("personId");
		
		// Construct data record for saving
        let payload = {
            "id": personId,
            "page" : "crt",
            "question_idx": currentQuestion,
            "question_text": questionText,
            "response": response,
            "rt" : readTimer(currentQuestion),
            "page_time" : getCurrentPageTime()
        }

		// Save and continue with next task
        let success = await writeData(payload);
        if(success) {
            showNextTask();
        }
        else {
            alert("Could not save data. Please contact us for assistance.");
        }
    });
	
	// Start the timer for the first question
	startTimer(currentQuestion);
});