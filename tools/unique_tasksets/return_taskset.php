<?php

$fp = fopen("tasksets.json", "r+");

// Acquire lock
if(flock($fp, LOCK_EX)) {
	// Open taskset file
	$state = fread($fp, filesize("tasksets.json"));
	if ($state === false) {
		die('Error reading the tasksets json');
	}
	
	// Decode taskset file
	$state_data = json_decode($state, true);
	
	if ($state_data === null) {
		die(json_encode(false));
	}
	
	// Check if the current tasksets left are empty
	if(count($state_data["tasksets_left"]) == 0) {
		$state_data["tasksets_left"] = $state_data["all_tasksets"];
	}
	
	// Select a task
	$selected_task_idx = array_rand($state_data["tasksets_left"], 1);
	$selected_task = $state_data["tasksets_left"][$selected_task_idx];
	array_splice($state_data["tasksets_left"], $selected_task_idx, 1);
	
	// Save state with removed item
	$state_json = json_encode($state_data, JSON_PRETTY_PRINT);
	if(strlen($state_json) != 0) {
		ftruncate($fp, 0);
		rewind($fp);
		fwrite($fp, $state_json);
	}

	flock($fp, LOCK_UN);
} else {
	die(json_encode(false));
}

echo json_encode($selected_task);