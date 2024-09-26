Unique Taskset Selection
========================
**Author: Daniel Brand** \
**Email: <daniel.brand@metech.tu-chemnitz.de>** \
**Date: 09.2024**

This folder contains the necessary PHP file for selecting unique tasksets **across** participants. This is something that is not possible with the pure client-side JavaScript-Scripts in the normal experiments.

A typical example is an experiment design where you want a different set of tasks for each participant (e.g., *latin-squares*).

It works by adjusting the `tasksets.json` to include a list of taskset-names to choose from. The PHP-Script `return_taskset.php` will then return one (randomly selected) item contained in the list `all_tasksets` inside of the JSON file. However, it will make sure that each of the items will be selected at once before repeating.

To do this, it uses the `tasksets_left`-list to save the current state. Therefore, it is important that `tasksets_left` is empty when starting the experiment officially, otherwise the selection might contain unwanted duplicates.

An example that illustrates how to use the Script is shown in `example.html`. The general flow consists of the following steps:
1. Adjust the `tasksets.json` file to contain taskset identifiers for all different tasksets you need
2. Make sure that your webserver/PHP is allowed to write into the JSON file by setting the permissions correctly: This should never be necessary locally using XAMPP, but might be necessary on an actual webserver
3. Calling (using *fetch*) `return_taskset.php` once at the start of your experiment to get a taskset identifier
4. Using the taskset identifier to determine which specific set of tasks to load (based on the taskset identifier). This needs to be done completely in your experiment code, this script only gives a unique taskset across participants

