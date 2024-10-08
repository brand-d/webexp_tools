const responseBoxes = document.getElementsByClassName("response_box");
const responseOptions = document.getElementsByName("response_options");
const guessBtn = document.getElementById("guess_btn");
const confidenceBtn = document.getElementById("confidence_btn");
const titleText = document.getElementById("title_text");

const premise1 = document.getElementById("premise1");
const premise2 = document.getElementById("premise2");

const responseAac = document.getElementById("Aac")
const responseAca = document.getElementById("Aca")
const responseIac = document.getElementById("Iac")
const responseIca = document.getElementById("Ica")
const responseEac = document.getElementById("Eac")
const responseEca = document.getElementById("Eca")
const responseOac = document.getElementById("Oac")
const responseOca = document.getElementById("Oca")

var interactions = [];
var currentTaskIdx = 0;
var currentTask = null;
var taskStartTime = Date.now();

function checkContinue() {
    for(let option of responseOptions) {
        if(option.checked) {
            guessBtn.disabled = false;
            confidenceBtn.disabled = false;
            return;
        }
    }
    guessBtn.disabled = true;
    confidenceBtn.disabled = true;
}

async function handleContinue(confidence) {
    setElementsDisabled(true, collection=responseOptions);
    guessBtn.disabled = true;
    guessBtn.setAttribute("aria-busy", "true");
    confidenceBtn.disabled = true;
    confidenceBtn.setAttribute("aria-busy", "true");

    let result = getSelectedInputsByName(responseOptions);

    let personId = sessionStorage.getItem("personId");

    let payload = {
        "id": personId,
        "page" : "syllogisms_tasks",
        "page_time" : Date.now() - pageStartTime,
        "response" : result,
        "interactions": interactions,
        "task": currentTask["syllogism"],
        "terms" : currentTask["content"],
        "confidence": confidence,
        "rt" : Date.now() - taskStartTime,
    }

    let success = await writeData(payload);
    if(success) {
        currentTaskIdx += 1;
        if(currentTaskIdx >= syllogisms.length)
            changePage("some_all.html");
        else {
            presentTask();
        }
    }
    else {
        alert("Could not save data. Please contact us for assistance.")
    }
}

function presentTask() {
    confidenceBtn.disabled = true;
    guessBtn.disabled = true;
    

    for(let chkbx of responseOptions) {
        chkbx.checked = false;
        chkbx.disabled = true;
    }

    currentTask = getTask(syllogisms, currentTaskIdx);
    let premises = createSyllogText(currentTask);
    premise1.textContent = premises["prem1"];
    premise2.textContent = premises["prem2"];

    responseAac.textContent = createConclusion("A", "ac", currentTask["content"]);
    responseAca.textContent = createConclusion("A", "ca", currentTask["content"]);
    responseIac.textContent = createConclusion("I", "ac", currentTask["content"]);
    responseIca.textContent = createConclusion("I", "ca", currentTask["content"]);
    responseEac.textContent = createConclusion("E", "ac", currentTask["content"]);
    responseEca.textContent = createConclusion("E", "ca", currentTask["content"]);
    responseOac.textContent = createConclusion("O", "ac", currentTask["content"]);
    responseOca.textContent = createConclusion("O", "ca", currentTask["content"]);

    for(let chkbx of responseOptions) {
        chkbx.checked = false;
        chkbx.disabled = false;
    }
    confidenceBtn.setAttribute("aria-busy", "false");
    guessBtn.setAttribute("aria-busy", "false");

    taskStartTime = Date.now();
    titleText.textContent = `Task ${currentTaskIdx + 1}/${syllogisms.length}`;
	interactions = [];
}

function init() {
    blockLeaving();

    for(let chkbx of responseOptions) {
        chkbx.addEventListener("change", function(e) {
            interactions.push({
                "time": Date.now() - taskStartTime,
               "option": chkbx.getAttribute("value")
            });
            checkContinue();
        });
    }

    for(let box of responseBoxes) {
        box.addEventListener("click", function(evt) {
            let chkbx = document.getElementById(this.getAttribute("for"));
            if(evt.target == chkbx) return;
             if(chkbx.disabled) return;
            chkbx.checked = true;
            chkbx.focus();
            interactions.push({
                "time": Date.now() - taskStartTime,
                "option": chkbx.getAttribute("value")
            });

            checkContinue();
        });
    }

    guessBtn.addEventListener("click", function() {
        handleContinue("guessed");
    });
    confidenceBtn.addEventListener("click", function() {
        handleContinue("confident");
    });

    // Init syllogisms
    shuffleTasks();

    // Start experiment
    presentTask();
}

window.addEventListener("load", init);