---
title: Experiment Framework Documentation
author: Daniel Brand
date: 09.2024
---
Experiment Framework Documentation
==================================
**Author: Daniel Brand** \
**Email: <daniel.brand@metech.tu-chemnitz.de>** \
**Date: 09.2024**

The goal of this project is to have a (semi-) standardized way of creating tasks for web-experiments.
This allows for the efficient re-use of already implemented tasks (e.g., test like the CORSI block tapping task, the cognitive reflection task or surveys like Need for Cognition, etc) when creating a new web-experiment.

To achieve this, some structural requirements need to be fulfilled. These are described in the following sections.

## General Structure
For a new experiment, you should create a new folder with a copy of the main components:
- `index.html`: The initial page of the experiment, which asks the participants for their consent. Once the consent is given, a new (currently rather empty) CSV-file for the participant's results is created on the server. After that, the first task of the experiment is started.
- `exp_init.js`: This file contains the basic specification of the experiment. They are discussed in detail in the section below. It is loaded if no specific specification file is defined using the URL parameter `study_spec`.
- `end.html`: This is the ending page. Here, participants are thanked for their participation and, in case of running via external platforms like Prolific, can return to the platform via a completion link.
- `common`: Here, the general stylesheets and the main JavaScript files are located. They should be included by all tasks. This ensures a uniform design for the participants and the hassle-free handling of saving to the respective CSV-file on the experiment server.
- `tasks`: This folder should contain a subfolder for each task in the experiment. If already implemented tasks should be re-used for the current experiment, they should also be copied to this folder.

### Experiment Definition: exp_init.js
The JavaScript file is used to specify the flow of the experiment. To this end, it offers the following fields:
- `WELCOME_TEXT`: The title text used in the header of the default landing page.
- `STUDY_TIME_ESTIMATE`: The text that should appear in the default landing page. It will complete the sentence *The study will take ...*.
- `AUTHOR_EMAIL`: The email that should be shown in the study landing page.
- `LANDING_PAGE_TEXTFILE`: In case that the text of the default landing page is generally not suited for the study, you can instead specify a new landing page here. All landing pages need to be located in the landingpage subfolder. They are partial HTML-files, that only define the inner text. It is recommended to use the default page (`default.html`) as a template.
- `PARTICIPANT_ID_PARAM_NAME`: Certain external platforms for acquiring participants provide a unique identifier for each participant via URL parameters (default is set for Prolific: *PROLIFIC_PID*). This field allows to set the name of the respective URL parameter. If set, the initial page will retrieve the participant ID and uses it as the name of the CSV file instead of a fully randomized name. This allows to connect the obtained data with demographics provided by the platform, or to inspect the data before accepting a participant's submission.
- `REJECT_REDIRECT_URL`: Specifies the URL that participant's should be sent to if they decline to give consent. Platforms like Prolific offer specific return links for that, which can then be added. Alternatively, a speficic webpage needs to be included that informs participants that they are excluded from participation.
- `COMPLETED_REDIRECT_URL`: Specifies the URL that participants are sent to after participation. On external platforms, this is often necessary to automatically bring them back and acknowledge their participation. 
- `tasks`: This list specifies the flow of the experiment. Each entry corresponds to the relative path of a task in the experiment. Participants are routed to these locations in the order defined here.
- `STUDY_SPECIFICATION`: When using multiple specifications (i.e., for realizing several conditions of the study that share most of the study flow), this field can be used as an identifier. It can be retrieved during the study using the `getStudySpecification` function provided by `webexp.js`.

### Adjusting Initial/Ending page
Depending on the study, it might be necessary to alter the ending page (e.g., when no redirection to another platform should happen, etc), or that the initial page (*landing page*) needs to be changed beyond what is possible with the  `LANDING_PAGE_TEXTFILE` option (i.e., when the layout should be altered substantially). In these cases, the respective HTML-files can be edited. In these cases, make sure that the logic for creating a file for the participant (using `createFileForPerson`) and for dealing with participants' completions is working properly.

## The common subfolder
The common subfolder contains three components for the experiments. A small overview is provided here, although it is advised to mostly rely on the template tasks (Need for Cognition and Mental Rotation) instead of dealing with the following files directly.

1. `css`: Contains the stylesheets that ensure a uniform layout/design for all pages of the experiment. We use [Pico CSS](https://picocss.com/) as a foundation. `main.css` contains base classes for most scenarios (and should therefore be included in all pages).
2. `js`: Contains the main JavaScript file (`webexp.js`) for the web-experiments. It provides functionality for saving data to the server, proceeding to the next task, changing page, etc. It should usually be included in all pages. Additionally, a JavaScript file containing utilities (`util.js`) is available, that offers functionality for some common problems (e.g., shuffling/randomizing of lists and managing timers to track response times).
3. `storage`: Contains PHP-scripts (for the server backend) that create a new CSV-file (`create_person.php`) and allow to write to a specific CSV-file (`save_data.php`). The CSV-files are located in the `data` subfolder. On a server, it is important that the webserver process is allowed to write to that folder.

# Important Functionality
In this section, a few of the functions provided by `webexp.js` are described. These functions should be sufficient for most of the typical interactions with the webserver and for the general flow of an experiment.

- `blockLeaving()`: Starts blocking participants from leaving the page (i.e., they might receive a warning if they attempt to close the tab or leave the page). However, this is dependent on the browser and respective settings, so that it might not work in all situations (since it would not generally a good thing to block people from leaving a page).
- `allowLeaving()`: Releases the block introduced by `blockLeaving`.
- `changePage(targetLocation)`: Changes the current URL/location and navigates to another page. When participants are blocked from leaving, this ensures that they are allowed to leave without seeing a warning.
- `getParticipantId(paramName)`: Obtains the URL argument for a given parameter name. Useful to obtain the participant ID when participants are coming from an external platform. Default for paramName is configured for Prolific.
- `createFileForPerson(personId, [phpPath])`: Creates a CSV-file for the participant on the server and returns if it was successful. If a personId is set to *null*, a random name is chosen. The name is also stored in the sessionStorage under the key *personId*. It can be retrieved as follows:
    ```
    let pId = sessionStorage.getItem("personId")
    ```
Additionally, the path to the backend PHP-scripts can be set here. However, it is advised to use the default and not to set this parameter.
- `writeData(payload, [personId], [phpPath])`: The corresponding function to `createFileForPerson`, which writes to the respective CSV file. The payload should be a dictionary that can be converted to JSON (i.e., that contains only primitive types like strings, numbers, booleans, lists and other dictionaries). The payload will be written as a new line to the CSV-file (with the format *timestamp;data*). If no specific personId is given, the ID will be retrieved from the sessionStorage. Therefore, it is advised to just pass a payload in most cases. If the communication with the server fails, it will retry sending the payload several times (with number, timeout and resending-delay speficied by `maxNumRetries`, `timeoutDuration` and `retryDelay`).
- `goToNextTask()`: Navigates to the next task specified in `exp_init.js`.
- `removeCurrentTask()`: Removes the current URL from the list of tasks. It is **mandatory** to do this once the participant navigated to a task successfully, otherwise `goToNextTask` will always loop.
- `pageStartTime`: This field is set to the moment when the page was loaded, so that it can be used to infer the time spent on the current page (this is done by `getCurrentPageTime()`).
- `getCurrentPageTime()`: Returns the time passed since the page was loaded.
- `getRemainingTasksList()`: Returns the list of remaining tasks. In combination with `overwriteTasksList`, this allows to alter the tasks list (e.g., to skip certain tasks based on previous results, or to allow branching).
- `overwriteTasksList(newTasks)`: Replaces the current tasks lists with a new one. Make sure to correctly specify the relative paths for each task, and to include a ending screen as the last task.
- `getStudySpecification()`: Returns the current study specification (if set via `exp_init.js`). Can be used to dynamically alter the behavior of the experiment, e.g., when having multiple conditions (like control vs. manipulation).
- `getCompletionUrl()`: Returns the URL that should be navigated to when the study is finished. Useful when creating custom end-pages.
- `getRejectUrl()`: Returns the URL that should be navigated to when no consent is given. Useful when creating custom consent-pages.
- `getTotalTimeOutsideStudy()`: Returns the total time spend with the study tab being inactive for the current page. Note that this value resets whenever a new page is loaded (or the current page is reloaded). Also, popups (e.g., from messengers, etc) can trigger this - however, these interruptions usually only lead to rather small inactivity times.

## Functionality provided by util.js
The functionality in `util.js` is completely optional, so the JavaScript file does not need to be included in every page. However, its functionality might be useful in several common cases for studies. It provides the following functions:
- `startTimer(name, [resetTimer])`: Starts a timer/stopwatch with a given name. The current elapsed time can be checked with `readTimer`. This allows to record the time needed for certain aspects of a task without having to store timestamps manually. When a name is given that already refers to an existing timer, it will (based on the optional boolean parameter *resetTimer*) either reset the timer (default) or continue the timer (when *resetTimer* is false).
- `readTimer(name)`: Returns the current time on a given timer (by name) in milliseconds. The timer will continue running.
- `stopTimer(name)`: Stops a timer with a given name and returns the current time on a given timer in milliseconds. The timer can be continued with `continueTimer`, or 
- `continueTimer(name)`: Set a timer with a given name to be running again. If the timer does not exist, it will be created. Essentially another way of calling `startTimer`, but with a more telling name for easier readability.
- `shuffle(list)`: Returns a shuffled copy of a list/array of elements. When a set is given instead of a list, it is converted to a list (with shuffled elements). Internally, the [Fisher-Yates shuffle](https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle) is used, which provides a non-biased permutation. 
- `getSelectedInputsByName(name)`: For a given name (that needs to correspond to the *name*-attribute of radio buttons or check buttons), the function returns all radio/check buttons that are currently selected. This allows easy access to the value in multiple-choice questionaires, etc. 
- `getSelectedInputsByName(inputs)`: For a given collection, the function returns all radio/check buttons that are currently selected. This allows easy access to the value in multiple-choice questionaires, etc.
- `setElementsDisabled(disabled, [name], [classname])`: The function sets the disabled state of all (DOM)-elements with a specific name or classname (referring to the HTML-attributes). Either a *name* or a *classname* has to be provided, if both are provided, the function will affect the union (i.e., elements that are selected by name as well as elements selected by classname). It can be convenient to use this function to quickly disable/enable a whole set of buttons/checkboxes (e.g., it is good practise to give all checkboxes for the same question the same name, so it is easy to just disable all of those in one go).
- `setElementsLoading(loading, [name], [classname])`: The function sets the loading state of all (DOM)-elements with a specific name or classname (referring to the HTML-attributes). Either a *name* or a *classname* has to be provided, if both are provided, the function will affect the union (i.e., elements that are selected by name as well as elements selected by classname). It can be convenient to use this function to quickly show/hide a loading circle (throbber) for a whole set of buttons/checkboxes.

# Guidelines for saving data
Although not mandatory from a technical point of view, it is beneficial to also adhere to a standard when saving data on the server. Generally, we recommend using a JavaScript dictionary as a payload when calling `writeData`, as they can usually be converted to JSON easily and allow for a great flexibility when it comes to storing behavioral data (which can range from a simple number to a complex path drawn by the participant using the mouse cursor).

We suggest using at least the following fields in the dictionary as a standard:
- `id`: The participant ID, which can be obtained from the sessionStorage by using the following:
    ```
    let pId = sessionStorage.getItem("personId")
    ```
- `page`: An identifier denoting which page the entry was recorded on, e.g., *raven_instructions*, *raven_test_block1*, etc.
- `page_time`: The total time spent on this page, which can be determined the following:
     ```
    let pageTime = getCurrentPageTime();
    ```
    In some cases (e.g., when the current page contains multiple trials) the total time spent on the page might not be meaningful. In these cases, it should not be included.

Furthermore, we suggest the following names for common concepts:
- `rt`: Response time for a single trial.
- `task`: Encoding of the item, e.g., *AA2* in the case of syllogistic reasoning. In case that no meaningful encoding exists/is feasible, it could also just denote a unique identifier (e.g., *nfc_1*), as long as it is possible to unambiguously assign it to the respective task/item. Note that `task` is used instead of the term `item`. While `item` and `trial` reflects the experimental design, `task` reflects the participants' view (i.e., having an additional workstep for each question, etc).
- `response`: Response of the participant to the specific task.

We want to encourage researchers to add more information: The better an experiment can be retraced based on the stored information, the better. Therefore, supplementary/additional information should definitely be stored - the list above is by no means intended to be conclusive. However, we think that beyond the fields listed above, it is likely that additional fields will be very specific for the respective experiment. Therefore, we will not suggest a standard for it, since it is likely to fall flat at a certain point - or will end up being too extensive to be helpful.

# Testing and running on a webserver
For a healthy development cycle, it is important that the study can be easily tested during implementation. We selected pure HTML/JavaScript/CSS and PHP for the framework, since it runs on most standard webservers without (much) additional configuration. Therefore, most webservers can be used locally to develop the experiment. We recommend [XAMPP](https://www.apachefriends.org/de/), since it is an easy local webserver based on th commonly used Apache Webserver that is available on all major systems.

When developing locally, using the development options (especially the console) in your browser is the best way to find problems. In some cases, however, the cache is to blame: When reloading, it is good practise to use a *hard reload* (e.g., by using CRTL + F5 on Windows), to ensure that the browser isn't using an outdated version of your code.

The transition from local development system to webserver is usually easy, since it should be not much more than moving the experiment folder onto a webserver. The only thing that needs to be configured on a live webserver are the permissions: For saving, it is important that the webserver process can access (and write to) the `data` subfolder in the `storage` folder. Additionally, the two PHP-scripts need also be accessed (and executed) by the webserver process. If the study cannot proceed when trying to save, these permissions are usually to blame.