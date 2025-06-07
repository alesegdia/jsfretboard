/**
 * UI Components Module
 * Handles HTML generation and utility functions for UI components
 */

// Default formulas for scales and chords
var default_formulas = [
	["1 2 3 4 5 6 7", "Ionian"],
	["1 2 b3 4 5 6 b7", "Dorian"],
	["1 b2 b3 4 5 b6 b7", "Phrygian"],
	["1 2 3 #4 5 6 7", "Lydian"],
	["1 2 3 4 5 6 b7", "Mixolydian"],
	["1 2 b3 4 5 b6 b7", "Aeolian"],
	["1 b2 b3 4 b5 b6 b7", "Locrian"],
	["1 3 5", "Major triads"],
	["1 b3 5", "Minor triads"],
	["1 b3 b5", "Diminished quatriads"],
	["1 3 5 7", "Major 7th triads"],
	["1 b3 5 b7", "Minor 7th quatriads"],
	["1 b3 b5 b7", "Half Diminished quatriads"],
	["1 b3 b5 bb7", "Fully Diminished quatriads"],
	["1 2 3 b5 b6 b7", "Whole Tone Scale"],
	["1 b2 b3 3 b5 5 6 b7", "Diminished Scale"],
	["1 b2 3 4 5 b6 b7", "Phrygian Dominant Scale"]
];

/**
 * Creates HTML for a select element with musical notes.
 * @param {string|number} id - The id for the select element.
 * @returns {string} HTML string for the select element.
 */
function createNotesSelectHTML(id) {
	return `
	<label for="select-notes">Base note</label>
	<div class="tooltip-wrapper">
		<select data-targetfretboard="${id}" name="select-notes" id="select-notes">
		<option value="A">A</option>
		<option value="Bb">A#/Bb</option>
		<option value="B">B</option>
		<option selected="selected" value="C">C</option>
		<option value="Db">C#/Db</option>
		<option value="D">D</option>
		<option value="Eb">D#/Eb</option>
		<option value="E">E</option>
		<option value="F">F</option>
		<option value="Gb">F#/Gb</option>
		<option value="G">G</option>
		<option value="Ab">G#/Ab</option>
		</select>
		<div class="tooltip">Clear custom formula to use base note selection</div>
	</div>
	`;
}

/**
 * Converts a string to a slug.
 * @param {string} str - The string to slugify.
 * @returns {string} The slugified string.
 */
function slugify(str) {
    str = str.replace(/^\s+|\s+$/g, ''); // trim
    str = str.toLowerCase();
  
    // remove accents, swap ñ for n, etc
    var from = "àáäâèéëêìíïîòóöôùúüûñç·/_,:;";
    var to   = "aaaaeeeeiiiioooouuuunc------";
    for (var i=0, l=from.length ; i<l ; i++) {
        str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
    }

    str = str.replace(/[^a-z0-9 -]/g, '') // remove invalid chars
        .replace(/\s+/g, '-') // collapse whitespace and replace by -
        .replace(/-+/g, '-'); // collapse dashes

    return str;
}

/**
 * Generates HTML for a select element with musical formulas.
 * @param {string|number} target_fretboard - The target fretboard id.
 * @returns {string} HTML string for the select element.
 */
function generateFormulasHTML(target_fretboard) {
	var markup = `
		<label for="formulas">Scales</label>
		<div class="tooltip-wrapper">
			<select data-targetfretboard="${target_fretboard}" name="formulas" id="formulas">
	`;

	for(var i = 0; i < default_formulas.length; i++) {
		var formula = default_formulas[i][0];
		var name = default_formulas[i][1];
		var nameslug = slugify(name);
		markup += `
			<option value="formula-${nameslug}" data-formula="${formula}">${name}</option>
		`;
	}
	markup += `
			</select>
			<div class="tooltip">Clear custom formula to use scale selection</div>
		</div>`;
	return markup;
}

/**
 * Creates an HTML element from a string and appends it to a target element.
 * @param {string} html_str - The HTML string to convert to an element.
 * @param {string} targetid - The id of the target element to append to.
 */
function createElementFromHTMLAndAppend(html_str, targetid) {
	var pivotDiv = document.createElement("div");
	pivotDiv.innerHTML = html_str;
	var container = document.getElementById(targetid);
	container.appendChild(pivotDiv);
}
