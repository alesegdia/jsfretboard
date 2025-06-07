/**
 * Main Entry Point Module
 * Handles initialization and global variables
 */

// Global variables
var lastCanvas = -1;
var currentCanvas = 0;
var all_fretboards = {};

// Initialize the UI components
createElementFromHTMLAndAppend(createNotesSelectHTML(0), "scales-container");
createElementFromHTMLAndAppend(generateFormulasHTML(0), "scales-container");

// Setup initial state
refreshFretboardSelects();
configChanges();

// Initial canvas selection update
updateCanvasSelection();

// Initialize the first fretboard on page load
document.addEventListener('DOMContentLoaded', function() {
	// Add the first canvas if none exist
	if (lastCanvas < 0) {
		addCanvas();
	}
	
	// Generate initial fretboard and save state
	generate();
	// Auto-save initial state
	autoSave();
});
