/**
 * Data Manager Module
 * Handles save/load functionality and fretboard state management
 */

/**
 * Loads data from the input field and redraws the fretboards.
 */
function loadData() {
	lastCanvas = -1;
	currentCanvas = 0;
	all_fretboards = {};

	rmAllCanvas();
	var loadData = document.getElementById("data-load");
	all_fretboards = JSON.parse(loadData.value);

	for (const [key, value] of Object.entries(all_fretboards)) {
		currentCanvas = key;
		loadOrSaveCurrent(false);
		addCanvas();
		generate();
	}

	refreshFretboardSelects();
	addClickHandlersToCanvases();
	updateCanvasSelection();
	
	// Update custom scale indicator after loading all data
	if (typeof updateCustomScaleIndicator === 'function') {
		updateCustomScaleIndicator();
	}
	
	// Auto-save after loading data
	autoSave();
}

/**
 * Auto-saves the current fretboard data to the save field (without downloading).
 */
function autoSave() {
	// First, make sure current canvas state is saved
	loadOrSaveCurrent(true);
	
	var saveDataField = document.getElementById("data-save");
	if (saveDataField) {
		var jsonData = JSON.stringify(all_fretboards);
		saveDataField.value = jsonData;
	}
}

/**
 * Saves the current fretboard data to a downloadable file or updates the save field.
 */
function saveData() {
	// First, make sure current canvas state is saved
	loadOrSaveCurrent(true);
	
	var saveDataField = document.getElementById("data-save");
	var jsonData = JSON.stringify(all_fretboards, null, 2);
	
	// Update the save field
	saveDataField.value = jsonData;
	
	// Create a downloadable file
	var blob = new Blob([jsonData], {type: 'application/json'});
	var url = URL.createObjectURL(blob);
	
	// Create a temporary download link
	var a = document.createElement('a');
	a.href = url;
	a.download = 'fretboard-data.json';
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
	URL.revokeObjectURL(url);
	
	alert('Data saved! The JSON has been copied to the save field and downloaded as a file.');
}

/**
 * Loads or saves the current fretboard configuration to/from the `all_fretboards` object.
 * @param {boolean} save - If true, saves the current UI values to `all_fretboards`.
 *                         If false, loads values from `all_fretboards` to the UI.
 */
function loadOrSaveCurrent(save) {
	var object = null;
	if(save) {
		object = {};
	} else {
		object = all_fretboards[currentCanvas];
	}	if(object == undefined) return;
	var ids = ["select-notes", "formulas", "txt-formula", "select-rendertype", "txt-starting-fret", "txt-ending-fret", "txt-num-frets", "txt-canvas-width", "txt-grid-cols", "slider-marker-size", "slider-note-size", "slider-string-spacing", "slider-fret-font-size", "slider-note-font-size", "slider-title-font-size"];
	for(var i = 0; i < ids.length; i++) {
		var current_id = ids[i];
		var item = document.getElementById(current_id);		if(item.tagName == "SELECT") {
			if(save) {
				object[current_id] = item.selectedIndex;				
			} else {
				item.selectedIndex = object[current_id];
			}
		} else if(item.tagName == "INPUT" && (item.type == "text" || item.type == "range")) {
			if(save) {
				object[current_id] = item.value;
			} else {
				item.value = object[current_id];
				// Update the display value for range inputs
				if (item.type == "range") {
					updateRangeDisplay(item);
				}
			}
		} else {
			console.assert(false);
		}
	}
	if(save) {
		all_fretboards[currentCanvas] = object;
	} else {
		// When loading values, update the custom scale indicator
		if (typeof updateCustomScaleIndicator === 'function') {
			// Use setTimeout to ensure DOM is updated before checking
			setTimeout(updateCustomScaleIndicator, 0);
		}
	}
}
