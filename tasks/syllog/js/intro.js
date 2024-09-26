var responseBoxes = document.getElementsByClassName("response_box");
var responseOptions = document.getElementsByName("response_options");
var guessBtn = document.getElementById("guess_btn");
var confidenceBtn = document.getElementById("confidence_btn");
var interactions = [];
function controlResponseOptions(disabledState) {
    for(let chkbx of responseOptions) {
        chkbx.disabled = disabledState;
    }
}
function checkContinue() {
    for(let chkbx of responseOptions) {
        if(chkbx.checked) {
            guessBtn.disabled = false;
            confidenceBtn.disabled = false;
            return;
        }
    }
    guessBtn.disabled = true;
    confidenceBtn.disabled = true;
}
async function handleContinue(confidence) {
    controlResponseOptions(true);
    guessBtn.disabled = true;
    guessBtn.setAttribute("aria-busy", "true");
    confidenceBtn.disabled = true;
    confidenceBtn.setAttribute("aria-busy", "true");
    let result = [];
    for(let chkbx of responseOptions) {
        if(chkbx.checked) {
            result.push(chkbx.value);
        }
    }
    let personId = sessionStorage.getItem("personId");
    let payload = {
        "id": personId,
        "page" : "syllogisms_instructions",
        "response" : result,
        "interactions": interactions,
        "task": "IA1",
        "terms" : ["tailors", "bikers", "teachers"],
        "confidence": confidence,
        "rt" : Date.now() - pageStartTime,
    }
    let success = await writeData(payload);
    if(success) {
        changePage("tasks.html");
    }
    else {
        alert("Could not save data. Please contact us for assistance.")
    }
}
function init() {
    removeCurrentTask();
    blockLeaving();
    for(let chkbx of responseOptions) {
        chkbx.addEventListener("input", function(e) {
            interactions.push({
                "time": Date.now() - pageStartTime,
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
                "time": Date.now() - pageStartTime,
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
}

window.addEventListener("load", init);