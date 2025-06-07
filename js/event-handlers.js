/**
 * Event Handlers Module
 * Handles event listeners and user interactions
 */

/**
 * Iterates over a predefined list of input element IDs and executes a callback function for each.
 * @param {function(HTMLElement):void} fn - The callback function to execute for each input element.
 */
function forAllInputs(fn) {
	var ids = ["select-notes", "formulas", "txt-formula", "select-rendertype", "txt-starting-fret", "txt-ending-fret", "txt-num-frets", "txt-canvas-width", "txt-grid-cols", "slider-marker-size", "slider-note-size", "slider-string-spacing", "slider-fret-font-size", "slider-note-font-size", "slider-title-font-size"];
	for(var i = 0; i < ids.length; i++) {
		var current_id = ids[i];
		var item = document.getElementById(current_id);
		if(item != null) {
			fn(item);			
		}
	}
}

/**
 * Sets up event listeners for configuration input elements to regenerate the fretboard on changes.
 */
function configChanges() {
	forAllInputs(function(item) {
		item.addEventListener("change", function() {
			generate();
			
			// Update custom scale indicator if this is the custom formula field
			if (item.id === 'txt-formula' && typeof updateCustomScaleIndicator === 'function') {
				updateCustomScaleIndicator();
			}
			
			// Update range display if this is a range input
			if (item.type === 'range' && typeof updateRangeDisplay === 'function') {
				updateRangeDisplay(item);
			}
			
			// Auto-save on every change
			autoSave();
		});
		item.addEventListener("keyup", function() {
			generate();
			
			// Update custom scale indicator if this is the custom formula field
			if (item.id === 'txt-formula' && typeof updateCustomScaleIndicator === 'function') {
				updateCustomScaleIndicator();
			}
			
			// Auto-save on every change
			autoSave();
		});
		// Add input event for range sliders for real-time updates
		if (item.type === 'range') {
			item.addEventListener("input", function() {
				if (typeof updateRangeDisplay === 'function') {
					updateRangeDisplay(item);
				}
				generate();
				autoSave();
			});
		}
	});
	
	// Add specific event listener for grid layout changes
	var gridColsInput = document.getElementById("txt-grid-cols");
	if (gridColsInput) {
		gridColsInput.addEventListener("change", function() {
			updateGridLayout();
		});
		gridColsInput.addEventListener("keyup", function() {
			updateGridLayout();
		});
	}
}

/**
 * Updates the grid layout based on the current input values.
 */
function updateGridLayout() {
	var cols = document.getElementById('txt-grid-cols').value;
	var container = document.getElementById('canvas-container');
	
	container.style.gridTemplateColumns = 'repeat(' + cols + ', 1fr)';
	
	// Auto-save on grid layout change
	autoSave();
}
