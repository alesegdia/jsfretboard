/**
 * Canvas Manager Module
 * Handles canvas creation, deletion, and management operations
 */

/**
 * Removes all canvas elements from the canvas container.
 */
function rmAllCanvas() {
	var canvasContainer = document.getElementById("canvas-container");
	canvasContainer.innerHTML = "";
	lastCanvas = -1;
	currentCanvas = 0;
}

/**
 * Adds click handlers to all existing canvas items to make them selectable.
 */
function addClickHandlersToCanvases() {
	var allCanvasItems = document.querySelectorAll('.canvas-item');
	allCanvasItems.forEach(function(canvasItem, index) {
		// Remove any existing click handlers to avoid duplicates
		canvasItem.onclick = null;
		
		// Add new click handler
		canvasItem.addEventListener('click', function() {
			selectCanvasByClick(index);
		});
	});
}

/**
 * Gets the 2D rendering context for the current canvas.
 * @returns {CanvasRenderingContext2D} The 2D rendering context.
 */
function CurrentCtx() {
	console.assert(currentCanvas >= 0 && currentCanvas <= lastCanvas);
	var c = document.getElementById("fretcanvas" + currentCanvas);
	var ctx = c.getContext("2d");
	return ctx;
}

/**
 * Updates the visual selection of canvas items to highlight the current active canvas.
 */
function updateCanvasSelection() {
	// Remove selected class from all canvas items
	var allCanvasItems = document.querySelectorAll('.canvas-item');
	allCanvasItems.forEach(function(item) {
		item.classList.remove('selected');
	});
	
	// Add selected class to current canvas item
	var currentCanvasElement = document.getElementById("fretcanvas" + currentCanvas);
	if(currentCanvasElement && currentCanvasElement.parentElement) {
		currentCanvasElement.parentElement.classList.add('selected');
	}
}

/**
 * Handles clicking on a canvas to select it.
 * @param {number} canvasId - The ID of the canvas that was clicked.
 */
function selectCanvasByClick(canvasId) {
	if(currentCanvas !== canvasId) {
		// Save current canvas state before switching
		loadOrSaveCurrent(true);
		
		// Switch to new canvas
		currentCanvas = canvasId;
		
		// Load new canvas configuration
		loadOrSaveCurrent(false);
		
		// Update dropdown selection
		var dropdown = document.getElementById("fretboard-select");
		if(dropdown) {
			dropdown.value = canvasId;
		}
		
		// Update visual selection
		updateCanvasSelection();
		
		// Update custom scale indicator after loading fretboard data
		if (typeof updateCustomScaleIndicator === 'function') {
			updateCustomScaleIndicator();
		}
		
		// Regenerate display with new settings
		generate();
		
		// Auto-save after selecting canvas
		autoSave();
	}
}

/**
 * Refreshes the fretboard dropdown with the current number of fretboards.
 */
function refreshFretboardSelects() {
	var fretboard_container = document.getElementById("fretboards-dropdown-group");
	fretboard_container.innerHTML = "";
	
	// Create the dropdown select element
	var select = document.createElement("select");
	select.id = "fretboard-select";
	select.name = "fretboard-select";
	select.onchange = function() { changedFretboards(this); };
	
	// Add options for each fretboard
	for(var i = 0; i <= lastCanvas; i++) {
		var option = document.createElement("option");
		option.value = i;
		option.textContent = "Fretboard #" + i;
		
		// Set the current canvas as selected
		if(i === currentCanvas) {
			option.selected = true;
		}
		
		select.appendChild(option);
	}
	
	fretboard_container.appendChild(select);
}

/**
 * Adds a new canvas for a fretboard and generates it.
 */
function addCanvas() {
	lastCanvas++;
	var canvasId = lastCanvas; // Capture the ID for the closure

	var newCanvas = document.createElement("div");
	newCanvas.className = "canvas-item"; // Add grid item class
	var canvasWidth;
	try {
		canvasWidth = all_fretboards[currentCanvas]["txt-canvas-width"];
	} catch(error) {
		canvasWidth = document.getElementById("txt-canvas-width").value;
	}
	newCanvas.innerHTML = "<canvas width=\"" + canvasWidth + "\" height=\"270\" id=\"fretcanvas" + canvasId + "\"></canvas>";
	
	// Add click handler to make canvas selectable
	newCanvas.addEventListener('click', function() {
		selectCanvasByClick(canvasId);
	});
	
	document.getElementById("canvas-container").appendChild(newCanvas);
	
	var prevCanvas = currentCanvas;
	currentCanvas = lastCanvas;
	refreshFretboardSelects();
	generate();
	updateCanvasSelection();
	currentCanvas = prevCanvas;
	// Auto-save after adding canvas
	autoSave();
}

/**
 * Removes the last canvas from the container.
 */
function rmCanvas() {
	if(lastCanvas < 0) {
		alert("No canvases to remove");
		return;
	}
	
	// Find and remove the canvas element
	var canvasToRemove = document.getElementById("fretcanvas" + lastCanvas);
	if(canvasToRemove) {
		// Remove the parent div (canvas-item)
		canvasToRemove.parentElement.remove();
	}
	
	// Remove from fretboards data
	delete all_fretboards[lastCanvas];
	
	// Decrease the canvas counter
	lastCanvas--;
	
	// Update the current canvas if it was pointing to the removed one
	if(currentCanvas > lastCanvas) {
		currentCanvas = lastCanvas >= 0 ? lastCanvas : 0;
		if(lastCanvas >= 0) {
			loadOrSaveCurrent(false);
		}
	}
	
	// Refresh the radio buttons and ensure correct selection
	refreshFretboardSelects();
	updateCanvasSelection();
	
	// Auto-save after removing canvas
	autoSave();
}

/**
 * Handles the change event for the fretboard dropdown selection.
 * Sets the current canvas and loads its configuration.
 * @param {HTMLSelectElement} elem - The select element that triggered the event.
 */
function changedFretboards(elem) {
	currentCanvas = Number(elem.value);
	loadOrSaveCurrent(false);
	updateCanvasSelection();
	
	// Update custom scale indicator after loading fretboard data
	if (typeof updateCustomScaleIndicator === 'function') {
		updateCustomScaleIndicator();
	}
	
	generate();
	// Auto-save after changing fretboards
	autoSave();
}
