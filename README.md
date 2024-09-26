PVA Webexperiment Tools
=======================
A collection of existing tasks and templates aiming to make the development of psychological web-experiments easier.

The template is made for a standard webserver configuration that supports PHP.

## What is contained in the repository?
- `tasks`: Contains a collection of tasks using the web experiment template. These can be used to easily re-use them (especially smaller tests like the *cognitive reflection tasks*). Additionally, they are meant to serve as examples for the creation of own experiments.
- `template`: The main template to use to create an own experiment.
- `tools`: Contain other (optional) scripts that might prove useful.
- `tools/unique_tasksets`: Contains a script that facilitates the assignment of different sets of tasks to participants (while ensuring that each taskset is assigned to a participant before having repeating and allowing duplicates). This is not possible in a purely client-side setup, so it requires another backend/server-script.

## How to start
 We recommend to start developing a new task by just copying the template. It can then serve as a starting point, that can be adapted/extended accordingly. It is best to use local webserver (e.g. [XAMPP](https://www.apachefriends.org/de/index.html)) for development.

 ## Dependencies
 The template and tasks contained in this repository use a local version of [Pico CSS](https://picocss.com/) for achieving a uniform styling. This is done to make the experiments also run locally (as one of the big advantages of creating web-experiments is that they can also be used locally in the lab). However, this also means that Pico CSS is not always up to date.
 