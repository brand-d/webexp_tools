const consentBtn = document.getElementById("consent_btn");
const rejectBtn = document.getElementById("reject_btn");

/* Loads the study specification javascript file dynamically.
 After loading, the specification is added to the DOM.
*/
function embedSpecification(url) {
	return new Promise((resolve, reject) => {
		const specScript = document.createElement('script');
		specScript.src = url;
		specScript.setAttribute("type", "text/javascript");
		specScript.setAttribute("async", true);
		document.body.appendChild(specScript);
		
		specScript.addEventListener("load", () => {
			resolve(true);
		});
		specScript.addEventListener("error", (ev) => {
			reject(false);
		});
	});
}

/* Checks for URL parameters and loads the respective study 
 specification file. If no URL parameters are present, or
 useCondition is false, the default is used (exp_init.js).
*/
function loadSpecification(useCondition) {
	let url = "exp_init.js";
	if(useCondition) {
		const urlParams = new URLSearchParams(window.location.search);
		if(urlParams.has("study_spec")) {
			url = `${urlParams.get("study_spec")}.js`;
		}
	}
	return embedSpecification(url);
}

window.addEventListener("load", async function() {
	let success = false;
	
	try {
		success = await loadSpecification(true);
	} catch {
		console.warn("Fallback: Loading default specification");
		success = await loadSpecification(false);
	}

	if(!success) {
		alert("Could not load study content.");
		return;
	}
	
	// Set the study title text
	const studyWelcome = document.getElementById("study_welcome");
	if(studyWelcome != null)
		studyWelcome.textContent = WELCOME_TEXT;
		
	// load the main text
	const serverResponse = await fetch(`landingpage/${LANDING_PAGE_TEXTFILE}`);
	if(!serverResponse.ok) {
		console.error("Could not reach server");
		alert("Error retrieving study text");
		return;
	}
	const data = await serverResponse.text();
	if(data == 0) {
		console.error("Could not reach server");
		alert("Error retrieving study text");
		return;
	}
	document.getElementById("main_section").innerHTML = data;
	
	// Insert the study time estimate and the email
	const timeEstimate = document.getElementById("estim_time");
	const authorEmail = document.getElementById("author_email");
	if(timeEstimate != null) timeEstimate.innerHTML = STUDY_TIME_ESTIMATE;
	if(authorEmail != null) authorEmail.innerHTML = `<a href="mailto:${AUTHOR_EMAIL}">${AUTHOR_EMAIL}</a>`;
	
	// Connect reject button
	rejectBtn.addEventListener("click", function() {
		window.location.replace(REJECT_REDIRECT_URL);
	});
	
	// Connect consent button
	consentBtn.addEventListener("click", async function() {
		// Show busy circle and disable buttons
		consentBtn.setAttribute("aria-busy", "true");
		consentBtn.disabled = true;
		rejectBtn.disabled = true;

		// Block leaving
		blockLeaving();

		// Obtain prolific PID (or other URL-based participant ID)
		let participantId = getParticipantId(paramName=PARTICIPANT_ID_PARAM_NAME);

		// Create file for that participant
		let created = await createFileForPerson(personId=participantId);

		// Store current URL to guide later navigation
		storeCurrentUrl();

		// If creation was successful, continue
		if(created) {
			goToNextTask();
		} else {
			alert("Could not save on server");
		}
	});
});