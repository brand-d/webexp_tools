/*
	Landing page settings
	These settings change the text on the landing page.
---------------------------------------------------------------------------
*/
// Welcome title Text
const WELCOME_TEXT = "Welcome to our study!";
// Time estimate
const STUDY_TIME_ESTIMATE = "about 15 minutes";
// Author email
const AUTHOR_EMAIL = "email@email.com";
/* Landing page text (from landingpage subfolder)
 Only change this, if you want a completely different landing page text */
const LANDING_PAGE_TEXTFILE = "default.html";

/*
	Participant Aquirement Integration
	Configures the integration with Prolific or similar services for 
	aquiring participants.
---------------------------------------------------------------------------
*/
// URL parameter name used for the participant ID (set to null if not used)
const PARTICIPANT_ID_PARAM_NAME = "PROLIFIC_PID";
// URL to direct a participant to if consent was not given
const REJECT_REDIRECT_URL = "https://www.google.com";
// URL to direct a participant to if the study was completed successfully
const COMPLETED_REDIRECT_URL = "https://www.bing.com";

/*
	Study definitions
---------------------------------------------------------------------------
*/
/* Task sequence: Specifies the study flow (i.e., sequence of tasks).
 They must be specified relative to the main index file. */
const tasks = [
	"tasks/template",
    "end.html"
];
/* Identifier name for the specification of the study.
 Only useful when loading different versions experiment using the
 study_spec-URL-parameter. Can be retrieved during the study 
 (e.g., to alter certain tasks).
 Default is 'main'. */
const STUDY_SPECIFICATION = "main";

/*
---------------------------------------------------------------------------
	Below here, it is recommended to not alter these lines.
	Saves the task list in session storage as well as the condition.
	These lines are necessary for the flow of the experiment/study
---------------------------------------------------------------------------
*/
sessionStorage.setItem("exp_tasks", JSON.stringify(tasks));
sessionStorage.setItem("exp_specification", STUDY_SPECIFICATION);
sessionStorage.setItem("exp_completion_url", COMPLETED_REDIRECT_URL);
sessionStorage.setItem("exp_reject_url", REJECT_REDIRECT_URL);