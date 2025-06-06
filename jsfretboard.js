/**
 * Removes all canvas elements from the canvas container.
 */
function rmAllCanvas()
{
	var canvasContainer = document.getElementById("canvas-container");
	canvasContainer.innerHTML = "";
	lastCanvas = -1;
	currentCanvas = 0;
}

/**
 * Adds click handlers to all existing canvas items to make them selectable.
 */
function addClickHandlersToCanvases()
{
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
 * Loads data from the input field and redraws the fretboards.
 */
function loadData()
{
	lastCanvas = -1;
	currentCanvas = 0;
	all_fretboards = {};

	rmAllCanvas();
	var loadData = document.getElementById("data-load");
	all_fretboards = JSON.parse(loadData.value);

	for (const [key, value] of Object.entries(all_fretboards))
	{
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
}

/**
 * Creates HTML for a select element with musical notes.
 * @param {string|number} id - The id for the select element.
 * @returns {string} HTML string for the select element.
 */
function createNotesSelectHTML(id)
{
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
 * Converts a string to a slug.
 * @param {string} str - The string to slugify.
 * @returns {string} The slugified string.
 */
function slugify(str)
{
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
function generateFormulasHTML(target_fretboard)
{
	var markup = `
		<label for="formulas">Scales</label>
		<div class="tooltip-wrapper">
			<select data-targetfretboard="${target_fretboard}" name="formulas" id="formulas">
	`;

	for(var i = 0; i < default_formulas.length; i++)
	{
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
function createElementFromHTMLAndAppend(html_str, targetid)
{
	var pivotDiv = document.createElement("div");
	pivotDiv.innerHTML = html_str;
	var container = document.getElementById(targetid);
	container.appendChild(pivotDiv);
}


createElementFromHTMLAndAppend(createNotesSelectHTML(0), "scales-container");
createElementFromHTMLAndAppend(generateFormulasHTML(0), "scales-container");

var lastCanvas = -1;
var currentCanvas = 0;
var all_fretboards = {};

/**
 * Gets the 2D rendering context for the current canvas.
 * @returns {CanvasRenderingContext2D} The 2D rendering context.
 */
function CurrentCtx()
{
	console.assert(currentCanvas >= 0 && currentCanvas <= lastCanvas);
	var c = document.getElementById("fretcanvas" + currentCanvas);
	var ctx = c.getContext("2d");
	return ctx;
}

var notes_natural 	= [ "C", "D", "E", "F", "G", "A", "B" ];
var intervals_pures = [  0,   2,   4,   5,   7,   9,  11  ];

// var string_start_notes = [ "G", "D", "A", "E" ];
var string_start_notes = [ "E", "B", "G", "D", "A", "E" ];

var intervals_colors = {
	"1": "red",
	"3": "blue",
	"b3": "blue",
	"5": "green",
	"b5": "green",
	"7": "#FF00FF",
	"b7": "#FF00FF"
};

/**
 * Calculates the numerical value of a musical note.
 * @param {string} note - The musical note (e.g., "C", "A#", "Bb").
 * @returns {number} The numerical value of the note (0-11).
 */
function calculate_note_value(note)
{
	var delta = 0;
	var data = /^([A-G])([b|#]*)$/g.exec(note);
	var note = data[1];
	var mods = data[2];
	var index = notes_natural.indexOf(note, 0);
	var interval = intervals_pures[index];
	
	var delta = 0;
	for(var i = 0; i < mods.length; i++)
	{
		var factor = mods[i] == "b" ? -1 : 1;
		delta += factor;
	}
	interval += delta;
	var min_interval = intervals_pures[0];
	var max_interval = intervals_pures[intervals_pures.length - 1];
	while(interval < min_interval) interval = max_interval + interval + 1;
	while(interval > max_interval) interval = interval - max_interval - 1;
	return interval;
}

/**
 * Gets the previous natural note in the musical scale.
 * @param {string} note - The musical note (e.g., "C", "D#").
 * @returns {number} The index of the previous natural note in `notes_natural`.
 */
function previous_natural_note(note)
{
	var note_index = notes_natural.indexOf(note[0], 0) - 1;
	if(note_index < 0)
	{
		console.assert(note_index == -1);
		note_index = 6;
	}
	return note_index;
}

/**
 * Calculates a musical note from a numerical value.
 * @param {number} value - The numerical value of the note (0-11).
 * @param {boolean} sharp - Whether to prefer sharp notation.
 * @param {boolean} force_accidental - Whether to force an accidental even if it's a natural note.
 * @returns {string} The musical note (e.g., "C", "A#", "Bb").
 */
function calculate_note_from_value(value, sharp, force_accidental)
{
	if(value > 11)
	{
		value = value % 12;
	}
	else if(value < 0)
	{
		while(value < 0)
		{
			value += 12;
		} 
	}
	var next_note_to_value_index = 0;
	var delta = 0;
	for(var i = 0; i < notes_natural.length; i++)
	{
		var v = intervals_pures[i];
		if(v >= value || i == notes_natural.length - 1)
		{
			delta = v - value;
			next_note_to_value_index = i;
			break;
		}
	}

	if(delta == 0 && !force_accidental)
	{
		return notes_natural[next_note_to_value_index];
	}
	else if(delta == 0 && force_accidental)
	{
		console.assert(false); // not implemented!
	}
	else if(delta == 1)
	{
		// need to add accidental
		if(sharp)
		{
			next_note_to_value_index--;
			if(next_note_to_value_index < 0)
			{
				console.assert(next_note_to_value_index == -1);
				next_note_to_value_index = 6;
			}
			return notes_natural[next_note_to_value_index] + "#";
		}
		else
		{
			// no ++ cause already is +1 from for loop
			if(next_note_to_value_index > 6)
			{
				console.assert(next_note_to_value_index == 7);
				next_note_to_value_index = 0;
			}
			return notes_natural[next_note_to_value_index] + "b"
		}
	}
	else
	{
		console.assert(false);
	}
}

/**
 * Checks if two notes are enharmonically equivalent.
 * @param {string} note1 - The first musical note.
 * @param {string} note2 - The second musical note.
 * @returns {boolean} True if the notes are enharmonically equivalent, false otherwise.
 */
function is_same_note(note1, note2)
{
	return calculate_note_value(note1) == calculate_note_value(note2);
}

/**
 * Gets the enharmonic equivalent of a note with the opposite accidental.
 * (e.g., "A#" becomes "Bb", "Gb" becomes "F#").
 * @param {string} note - The musical note.
 * @returns {string} The enharmonically equivalent note.
 */
function get_analogue_accidental(note)
{
	var note_value = calculate_note_value(note);
	return calculate_note_from_value(note_value, is_flat_note(note));
}

/**
 * Converts a musical interval to its semitone value.
 * @param {string} interval - The musical interval (e.g., "1", "b3", "#5").
 * @returns {number} The number of semitones in the interval.
 */
function interval_to_semitones(interval)
{
	var found_mod = null;
	var delta = 0;
	
	var data = /^([b|#]*)(\d+)$/g.exec(interval);
	var mods = data[1];
	var interval = data[2];

	for(var i = 0; i < mods.length; i++)
	{
		var factor = mods[i] == "b" ? -1 : 1;
		delta += factor;
	}

	return intervals_pures[Number(interval) - 1] + delta;
}

/**
 * Fills a rectangle on the current canvas.
 * @param {number} x - The x-coordinate of the top-left corner.
 * @param {number} y - The y-coordinate of the top-left corner.
 * @param {number} w - The width of the rectangle.
 * @param {number} h - The height of the rectangle.
 * @param {string} color - The fill color of the rectangle.
 */
function fill_rect(x, y, w, h, color)
{
	var ctx = CurrentCtx();
	ctx.fillStyle = color;
	ctx.fillRect(x, y, w, h);
}

/**
 * Creates and draws a fretboard on the canvas.
 * @param {number} dx - The x-offset for drawing.
 * @param {number} dy - The y-offset for drawing.
 * @param {number} width - The width of the fretboard.
 * @param {number} height - The height of the fretboard.
 * @param {number} spacing_limits - The spacing at the top and bottom of the strings.
 * @param {number} thin_string_height - The height of the thinnest string.
 * @param {number} string_inc - The increment in height for each subsequent string.
 * @param {number|string} start_fret - The starting fret number.
 * @param {number} frets - The total number of frets to display.
 * @returns {object} An object with methods to interact with the fretboard.
 */
function create_fretboard(dx, dy, width, height, spacing_limits, thin_string_height, string_inc, start_fret, frets)
{
	start_fret = Number(start_fret);
	var first_string_start = spacing_limits;
	var last_string_start = height - spacing_limits;
	var space_to_place_strings = height - spacing_limits * 2;
	var space_between_strings = space_to_place_strings / 5;

	var fret_space = width / frets;
	fill_rect(dx, dy, width, height, "#FEFFA2");

	for(var i = start_fret; i < start_fret + frets; i++)
	{
		fill_rect(dx + (i - start_fret) * fret_space, dy, 3, height, "#7E7E7E");
	}

	for(var i = 0; i < string_start_notes.length; i++)
	{
		string_height = thin_string_height + string_inc * i;
		startY = first_string_start + i * space_between_strings - string_height / 2;
		fill_rect(dx, dy + startY, width, string_height, "#B6B6B6");
	}


	function draw_fret_circle(fretnum, doble)
	{
		var circle_color = "#C4AF86"

		draw_fret_number(start_fret, fretnum);

		fretnum -= start_fret;
		if(fretnum > 0 && fretnum <= frets)
		{
			if(doble)
			{
				fill_circle(dx + fret_space * (fretnum - 1) + fret_space / 2, dy + 2 * height / 3, 10, circle_color);						
				fill_circle(dx + fret_space * (fretnum - 1) + fret_space / 2, dy + height / 3, 10, circle_color);						
			}
			else
			{
				fill_circle(dx + fret_space * (fretnum - 1) + fret_space / 2, dy + height / 2, 10, circle_color);										
			}

		}

	}

	function draw_fret_number(start_fret, fretnum)
	{
		var circle_color = "#000000"
		var fretnum2 = fretnum - start_fret;
		if(fretnum2 > 0 && fretnum2 <= frets)
		{
			draw_text(dx + fret_space * (fretnum2 - 1) + fret_space / 2, dy + height + 15, fretnum);
		}
	}

	draw_fret_circle(3);
	draw_fret_circle(5);
	draw_fret_circle(7);
	draw_fret_circle(9);
	draw_fret_circle(12, true);
	draw_fret_circle(15);
	draw_fret_circle(17);
	draw_fret_circle(19);
	draw_fret_circle(21);
	draw_fret_circle(24, true);

	function draw_text(cx, cy, text)
	{
		var ctx = CurrentCtx();
		ctx.fillStyle = "black";
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		ctx.fillText(text, cx, cy);
	}

	return {
		get_note_position: function(string, fret) {
			var x = fret_space * (fret - 1) + fret_space / 2;
			var y = first_string_start + string * space_between_strings - string_height / 2;
			return [x, y];
		},
		render_scale: function(fretboard_array, render_method, start_fret, num_frets) {
			start_fret = Number(start_fret);
			var ignore_open = start_fret > 0;
			for(var i = 0; i < fretboard_array.length; i++)
			{
				for(var j = start_fret; j < fretboard_array[i].length; j++)
				{
					var item = fretboard_array[i][j];
					var note = item["note"];
					var interval = item["interval"];
					if(note !== undefined)
					{
						this.draw_note(i, j - start_fret, item[render_method], intervals_colors[interval], ignore_open);
					}
				}
			}
		},
		draw_note: function (string, fret, text, color, ignore_open) {
			if(fret == 0 && ignore_open)
			{
				return;
			}

			var ctx = CurrentCtx();
			var position = this.get_note_position(string, fret);
			if(color === undefined)
			{
				color = "black";
			}
			var defx = dx + position[0];
			if(fret == 0)
			{
				defx = dx - 15;
			}
			fill_circle(defx, dy + position[1], 12, color);
			ctx.fillStyle = "white";
			ctx.textAlign = "center";
			ctx.textBaseline = "middle";
			ctx.fillText(text, defx, dy + position[1]);
		}
	};
}

/**
 * Fills a circle on the current canvas.
 * @param {number} cx - The x-coordinate of the center of the circle.
 * @param {number} cy - The y-coordinate of the center of the circle.
 * @param {number} radius - The radius of the circle.
 * @param {string} color - The fill color of the circle.
 */
function fill_circle(cx, cy, radius, color)
{
	var ctx = CurrentCtx();
	ctx.beginPath();
	ctx.arc(cx, cy, radius, 0, 2 * Math.PI, false);
	ctx.fillStyle = color;
	ctx.fill();
}


/**
 * Checks if a note string is valid.
 * Asserts that the note is 1 or 2 characters, the first character is a natural note,
 * and the second character (if present) is 'b' or '#'.
 * @param {string} note - The musical note string.
 */
function check_valid_note(note)
{
	console.assert(note.length == 1 || note.length == 2);
	console.assert(notes_natural.indexOf(note[0], 0) != -1);
	if(note.length == 2)
	{
		console.assert(note[1] == "b" || note[1] == "#");
	}
}

/**
 * Checks if a note is a flat note.
 * @param {string} note - The musical note.
 * @returns {boolean} True if the note is flat, false otherwise.
 */
function is_flat_note(note)
{
	check_valid_note(note);
	return note[1] == "b";
}

/**
 * Checks if a note is a sharp note.
 * @param {string} note - The musical note.
 * @returns {boolean} True if the note is sharp, false otherwise.
 */
function is_sharp_note(note)
{
	check_valid_note(note);
	return note[1] == "#";
}

/**
 * Calculates a note by transposing a base note by a number of semitones.
 * @param {string} base_note - The starting musical note.
 * @param {number} semitones - The number of semitones to transpose.
 * @param {boolean} [sharp=true] - Whether to prefer sharp notation for the result.
 * @returns {string} The resulting musical note.
 */
function calculate_note_from(base_note, semitones, sharp)
{
	if(sharp === undefined)
	{
		sharp = true;
	}
	var value = calculate_note_value(base_note) + semitones;
	return calculate_note_from_value(value, sharp);
}

/**
 * Gets the musical note at a specific string and fret position.
 * @param {number} string - The string number (0-indexed).
 * @param {number} fret - The fret number.
 * @returns {string} The musical note at the given position.
 */
function get_note_in_position(string, fret)
{
	var string_note = string_start_notes[string];
	var note = calculate_note_from(string_note, fret);
	return note;
}

/**
 * (This function seems incomplete or has a typo: `get_note_`)
 * Gets the semitone value of a note at a specific string and fret, relative to a base note.
 * @param {number} string - The string number (0-indexed).
 * @param {number} fret - The fret number.
 * @param {string} base_note - The base note for comparison.
 * @returns {string} The musical note at the given position.
 */
function get_note_in_position_semitones(string, fret, base_note)
{
	var base_note_index = get_note_ // Potential typo here
	var string_note = string_start_notes[string];
	var note = calculate_note_from(string_note, fret);
	return note;
}

var interval_names = {
	"0": "P1",
	"1": "P1",
	"2": "M2",
	"b2": "m2",
	"b3": "m3",
	"3": "M3",
	"4": "P4",
	"5": "P5",
	"b5": "°5",
	"#4": "+4",
	"b6": "m6",
	"6": "M6",
	"b7": "m7",
	"7": "M7"
};

/**
 * Generates a musical scale from a base note and a formula.
 * @param {string} base_note - The root note of the scale.
 * @param {string[]} formula - An array of interval strings (e.g., ["1", "b3", "5"]).
 * @returns {object[]} An array of objects, each representing a note in the scale
 *                     with its `note`, `interval`, and `interval_name`.
 */
function get_scale_from_formula(base_note, formula)
{
	var scale = [{
		"note": base_note,
		"interval": formula[0],
		"interval_name": interval_names["1"]
	}];


	for(var i = 1; i < formula.length; i++)
	{
		var interval_to_semitone = interval_to_semitones(formula[i]);
		var scale_note = calculate_note_from(base_note, interval_to_semitone);
		var should_switch = false;
		for(var j = 0; j < scale.length; j++)
		{
			var present_note = scale[j];
			if(present_note["note"][0] == scale_note[0])
			{
				should_switch = true;
				break;
			}
		}
		if(should_switch) {
			var accidental = get_analogue_accidental(scale_note);
			scale_note = accidental;						
		}
		scale.push({
			"note": scale_note,
			"interval": formula[i],
			"interval_name": interval_names[formula[i]]
		});
	}
	return scale;
}

function get_interval_name_from_interval(interval)
{
	var interval = interval_to_semitones(interval)
}

/**
 * Creates an empty 2D array representing a fretboard.
 * @param {number} strings - The number of strings.
 * @param {number} frets - The number of frets.
 * @returns {Array<Array<number>>} A 2D array initialized with -1.
 */
function create_empty_fretboard_array(strings, frets)
{
	var fretboard_array = [];
	for(var i = 0; i < strings; i++)
	{
		var string_array = [];
		for(var j = 0; j < frets; j++)
		{
			string_array.push(-1);
		}
		fretboard_array.push(string_array);
	}
	return fretboard_array;
}

/**
 * Gets the numerical value of a musical note. (Alias for `calculate_note_value`)
 * @param {string} note - The musical note.
 * @returns {number} The numerical value of the note (0-11).
 */
function get_note_position(note)
{
	return calculate_note_value(note);
}

/**
 * Generates a fretboard array populated with notes from a scale.
 * @param {number} frets - The total number of frets on the fretboard.
 * @param {string} base_note - The root note of the scale.
 * @param {string[]} formula - An array of interval strings for the scale.
 * @param {string} representation - (Unused parameter) The desired representation of notes.
 * @returns {Array<Array<object>>} A 2D array representing the fretboard,
 *                                   where each cell contains note information or an empty object.
 */
function generate_scale(frets, base_note, formula, representation)
{
	var fretboard = create_empty_fretboard_array(string_start_notes.length, frets);
	var scale = get_scale_from_formula(base_note, formula);
	for(var i = 0; i < string_start_notes.length; i++)
	{
		for(var j = 0; j < frets; j++)
		{
			var note_content = {};
			var note_pos = get_note_in_position(i, j);
			var analogue = get_analogue_accidental(note_pos);
			var original_filter_list = scale.filter(item => item.note == note_pos);
			var analogue_filter_list = scale.filter(item => item.note == analogue);
			if(original_filter_list.length > 0)
			{
				note_content = original_filter_list[0];
			}
			else if(analogue_filter_list.length > 0)
			{
				note_content = analogue_filter_list[0];
			}
			fretboard[i][j] = note_content;
		}
	}
	return fretboard;
}

/**
 * Generates and renders the fretboard based on current UI selections.
 */
function generate()
{
	var fretcanvas = document.getElementById("fretcanvas" + currentCanvas);
	fretcanvas.width = Number(document.getElementById("txt-canvas-width").value);

	var start_fret = Number(document.getElementById("txt-starting-fret").value);
	if(start_fret > 0)
	{
		start_fret = start_fret - 1;
	}
	var num_frets = Number(document.getElementById("txt-num-frets").value);

	var select_note = document.getElementById("select-notes");
	var selected_note = select_note[select_note.selectedIndex].value;

	var select_render = document.getElementById("select-rendertype");
	var selected_render = select_render[select_render.selectedIndex].value;

	var formulas = document.getElementById("formulas");
	
	var selected_item = formulas[formulas.selectedIndex];
	var selected = selected_item.value;

	var data_formula = selected_item.dataset.formula.trim().split(/\s+/);

 	var custom_formula_txt = document.getElementById("txt-formula").value.trim();
	var custom_formula = custom_formula_txt.split(/\s+/);
	var name;

	var ctx = CurrentCtx();
	ctx.font = "bold 14px Arial";

	ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
	var fretboard = create_fretboard(40, 50, ctx.canvas.width - 50, 200, 15, 1, 1, start_fret, num_frets);

	if(custom_formula.length > 1)
	{
		name = selected_note + " " + custom_formula_txt;
		scale = generate_scale(start_fret + num_frets + 1, selected_note, custom_formula);
	}
	else
	{
		name = selected_note + " " + selected_item.text;
		scale = generate_scale(start_fret + num_frets + 1, selected_note, data_formula);
	}

	var prev_style = ctx.font;
	ctx.font = "bold 32px Arial";
	ctx.fillStyle = "black";
	ctx.textAlign = "left";
	ctx.textBaseline = "middle";
	ctx.fillText(name, 30, 30);
	ctx.font = prev_style;
	fretboard.render_scale(scale, selected_render, start_fret, num_frets);

	loadOrSaveCurrent(true);
}

/**
 * Iterates over a predefined list of input element IDs and executes a callback function for each.
 * @param {function(HTMLElement):void} fn - The callback function to execute for each input element.
 */
function forAllInputs (fn)
{
	var ids = ["select-notes", "formulas", "txt-formula", "select-rendertype", "txt-starting-fret", "txt-num-frets", "txt-canvas-width", "txt-grid-cols"];
	for(var i = 0; i < ids.length; i++)
	{
		var current_id = ids[i];
		var item = document.getElementById(current_id);
		if(item != null)
		{
			fn(item);			
		}
	}
}

/**
 * Sets up event listeners for configuration input elements to regenerate the fretboard on changes.
 */
function configChanges()
{
	forAllInputs(function(item)
	{
		item.addEventListener("change", function() {
			generate();
			
			// Update custom scale indicator if this is the custom formula field
			if (item.id === 'txt-formula' && typeof updateCustomScaleIndicator === 'function') {
				updateCustomScaleIndicator();
			}
			
			saveItem = document.getElementById("data-save");
			saveItem.value = JSON.stringify(all_fretboards);
		});
		item.addEventListener("keyup", function() {
			generate();
			
			// Update custom scale indicator if this is the custom formula field
			if (item.id === 'txt-formula' && typeof updateCustomScaleIndicator === 'function') {
				updateCustomScaleIndicator();
			}
			
			saveItem = document.getElementById("data-save");
			saveItem.value = JSON.stringify(all_fretboards);
		});
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
	
	// Save the configuration
	var saveItem = document.getElementById("data-save");
	saveItem.value = JSON.stringify(all_fretboards);
}

/**
 * Loads or saves the current fretboard configuration to/from the `all_fretboards` object.
 * @param {boolean} save - If true, saves the current UI values to `all_fretboards`.
 *                         If false, loads values from `all_fretboards` to the UI.
 */
function loadOrSaveCurrent (save)
{
	var object = null;
	if(save)
	{
		object = {};
	}
	else
	{
		object = all_fretboards[currentCanvas];
	}
	if(object == undefined) return;
	var ids = ["select-notes", "formulas", "txt-formula", "select-rendertype", "txt-starting-fret", "txt-num-frets", "txt-canvas-width", "txt-grid-cols"];
	for(var i = 0; i < ids.length; i++)
	{
		var current_id = ids[i];
		var item = document.getElementById(current_id);
		if(item.tagName == "SELECT")
		{
			if(save)
			{
				object[current_id] = item.selectedIndex;				
			}
			else
			{
				item.selectedIndex = object[current_id];
			}
		}
		else if(item.tagName = "INPUT" && item.type == "text")
		{
			if(save)
			{
				object[current_id] = item.value;
			}
			else
			{
				item.value = object[current_id];
			}
		}
		else
		{
			console.assert(false);
		}
	}
	if(save)
	{
		all_fretboards[currentCanvas] = object;
	}
	else
	{
		// When loading values, update the custom scale indicator
		if (typeof updateCustomScaleIndicator === 'function') {
			// Use setTimeout to ensure DOM is updated before checking
			setTimeout(updateCustomScaleIndicator, 0);
		}
	}
}

/**
 * Updates the visual selection of canvas items to highlight the current active canvas.
 */
function updateCanvasSelection()
{
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
/**
 * Updates the visual selection of canvas items to highlight the current active canvas.
 */
function updateCanvasSelection()
{
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
function selectCanvasByClick(canvasId)
{
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
	}
}

/**
 * Refreshes the fretboard dropdown with the current number of fretboards.
 */
function refreshFretboardSelects()
{
	var fretboard_container = document.getElementById("fretboards-dropdown-group");
	fretboard_container.innerHTML = "";
	
	// Create the dropdown select element
	var select = document.createElement("select");
	select.id = "fretboard-select";
	select.name = "fretboard-select";
	select.onchange = function() { changedFretboards(this); };
	
	// Add options for each fretboard
	for(var i = 0; i <= lastCanvas; i++)
	{
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
function addCanvas()
{
	lastCanvas++;
	var canvasId = lastCanvas; // Capture the ID for the closure

	var newCanvas = document.createElement("div");
	newCanvas.className = "canvas-item"; // Add grid item class
	var canvasWidth;
	try
	{
		canvasWidth = all_fretboards[currentCanvas]["txt-canvas-width"];
	}
	catch(error)
	{
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
}

/**
 * Removes the last canvas from the container.
 */
function rmCanvas()
{
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
	
	// Update save data
	var saveItem = document.getElementById("data-save");
	saveItem.value = JSON.stringify(all_fretboards);
}

/**
 * Handles the change event for the fretboard dropdown selection.
 * Sets the current canvas and loads its configuration.
 * @param {HTMLSelectElement} elem - The select element that triggered the event.
 */
function changedFretboards(elem)
{
	currentCanvas = Number(elem.value);
	loadOrSaveCurrent(false);
	updateCanvasSelection();
	
	// Update custom scale indicator after loading fretboard data
	if (typeof updateCustomScaleIndicator === 'function') {
		updateCustomScaleIndicator();
	}
	
	generate();
}

refreshFretboardSelects();

configChanges();
// Initial canvas selection update
updateCanvasSelection();
//generate();
