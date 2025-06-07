/**
 * Music Theory Module
 * Handles musical note calculations, intervals, and scale generation
 */

// Musical constants
var notes_natural = ["C", "D", "E", "F", "G", "A", "B"];
var intervals_pures = [0, 2, 4, 5, 7, 9, 11];
var string_start_notes = ["E", "B", "G", "D", "A", "E"];

var intervals_colors = {
	"1": "red",
	"3": "blue",
	"b3": "blue",
	"5": "green",
	"b5": "green",
	"7": "#FF00FF",
	"b7": "#FF00FF"
};

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
 * Calculates the numerical value of a musical note.
 * @param {string} note - The musical note (e.g., "C", "A#", "Bb").
 * @returns {number} The numerical value of the note (0-11).
 */
function calculate_note_value(note) {
	var delta = 0;
	var data = /^([A-G])([b|#]*)$/g.exec(note);
	var note = data[1];
	var mods = data[2];
	var index = notes_natural.indexOf(note, 0);
	var interval = intervals_pures[index];
	
	var delta = 0;
	for(var i = 0; i < mods.length; i++) {
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
function previous_natural_note(note) {
	var note_index = notes_natural.indexOf(note[0], 0) - 1;
	if(note_index < 0) {
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
function calculate_note_from_value(value, sharp, force_accidental) {
	if(value > 11) {
		value = value % 12;
	} else if(value < 0) {
		while(value < 0) {
			value += 12;
		}
	}
	var next_note_to_value_index = 0;
	var delta = 0;
	for(var i = 0; i < notes_natural.length; i++) {
		var v = intervals_pures[i];
		if(v >= value || i == notes_natural.length - 1) {
			delta = v - value;
			next_note_to_value_index = i;
			break;
		}
	}

	if(delta == 0 && !force_accidental) {
		return notes_natural[next_note_to_value_index];
	} else if(delta == 0 && force_accidental) {
		console.assert(false); // not implemented!
	} else if(delta == 1) {
		// need to add accidental
		if(sharp) {
			next_note_to_value_index--;
			if(next_note_to_value_index < 0) {
				console.assert(next_note_to_value_index == -1);
				next_note_to_value_index = 6;
			}
			return notes_natural[next_note_to_value_index] + "#";
		} else {
			// no ++ cause already is +1 from for loop
			if(next_note_to_value_index > 6) {
				console.assert(next_note_to_value_index == 7);
				next_note_to_value_index = 0;
			}
			return notes_natural[next_note_to_value_index] + "b"
		}
	} else {
		console.assert(false);
	}
}

/**
 * Checks if two notes are enharmonically equivalent.
 * @param {string} note1 - The first musical note.
 * @param {string} note2 - The second musical note.
 * @returns {boolean} True if the notes are enharmonically equivalent, false otherwise.
 */
function is_same_note(note1, note2) {
	return calculate_note_value(note1) == calculate_note_value(note2);
}

/**
 * Gets the enharmonic equivalent of a note with the opposite accidental.
 * (e.g., "A#" becomes "Bb", "Gb" becomes "F#").
 * @param {string} note - The musical note.
 * @returns {string} The enharmonically equivalent note.
 */
function get_analogue_accidental(note) {
	var note_value = calculate_note_value(note);
	return calculate_note_from_value(note_value, is_flat_note(note));
}

/**
 * Converts a musical interval to its semitone value.
 * @param {string} interval - The musical interval (e.g., "1", "b3", "#5").
 * @returns {number} The number of semitones in the interval.
 */
function interval_to_semitones(interval) {
	var found_mod = null;
	var delta = 0;
	
	var data = /^([b|#]*)(\d+)$/g.exec(interval);
	var mods = data[1];
	var interval = data[2];

	for(var i = 0; i < mods.length; i++) {
		var factor = mods[i] == "b" ? -1 : 1;
		delta += factor;
	}

	return intervals_pures[Number(interval) - 1] + delta;
}

/**
 * Checks if a note string is valid.
 * @param {string} note - The musical note string.
 */
function check_valid_note(note) {
	console.assert(note.length == 1 || note.length == 2);
	console.assert(notes_natural.indexOf(note[0], 0) != -1);
	if(note.length == 2) {
		console.assert(note[1] == "b" || note[1] == "#");
	}
}

/**
 * Checks if a note is a flat note.
 * @param {string} note - The musical note.
 * @returns {boolean} True if the note is flat, false otherwise.
 */
function is_flat_note(note) {
	check_valid_note(note);
	return note[1] == "b";
}

/**
 * Checks if a note is a sharp note.
 * @param {string} note - The musical note.
 * @returns {boolean} True if the note is sharp, false otherwise.
 */
function is_sharp_note(note) {
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
function calculate_note_from(base_note, semitones, sharp) {
	if(sharp === undefined) {
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
function get_note_in_position(string, fret) {
	var string_note = string_start_notes[string];
	var note = calculate_note_from(string_note, fret);
	return note;
}

/**
 * Gets the numerical value of a musical note. (Alias for `calculate_note_value`)
 * @param {string} note - The musical note.
 * @returns {number} The numerical value of the note (0-11).
 */
function get_note_position(note) {
	return calculate_note_value(note);
}

/**
 * Generates a musical scale from a base note and a formula.
 * @param {string} base_note - The root note of the scale.
 * @param {string[]} formula - An array of interval strings (e.g., ["1", "b3", "5"]).
 * @returns {object[]} An array of objects, each representing a note in the scale
 *                     with its `note`, `interval`, and `interval_name`.
 */
function get_scale_from_formula(base_note, formula) {
	var scale = [{
		"note": base_note,
		"interval": formula[0],
		"interval_name": interval_names["1"]
	}];

	for(var i = 1; i < formula.length; i++) {
		var interval_to_semitone = interval_to_semitones(formula[i]);
		var scale_note = calculate_note_from(base_note, interval_to_semitone);
		var should_switch = false;
		for(var j = 0; j < scale.length; j++) {
			var present_note = scale[j];
			if(present_note["note"][0] == scale_note[0]) {
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

/**
 * Creates an empty 2D array representing a fretboard.
 * @param {number} strings - The number of strings.
 * @param {number} frets - The number of frets.
 * @returns {Array<Array<number>>} A 2D array initialized with -1.
 */
function create_empty_fretboard_array(strings, frets) {
	var fretboard_array = [];
	for(var i = 0; i < strings; i++) {
		var string_array = [];
		for(var j = 0; j < frets; j++) {
			string_array.push(-1);
		}
		fretboard_array.push(string_array);
	}
	return fretboard_array;
}

/**
 * Generates a fretboard array populated with notes from a scale.
 * @param {number} frets - The total number of frets on the fretboard.
 * @param {string} base_note - The root note of the scale.
 * @param {string[]} formula - An array of interval strings for the scale.
 * @param {string} representation - (Unused parameter) The desired representation of notes.
 * @returns {Array<Array<object>>} A 2D array representing the fretboard.
 */
function generate_scale(frets, base_note, formula, representation) {
	var fretboard = create_empty_fretboard_array(string_start_notes.length, frets);
	var scale = get_scale_from_formula(base_note, formula);
	for(var i = 0; i < string_start_notes.length; i++) {
		for(var j = 0; j < frets; j++) {
			var note_content = {};
			var note_pos = get_note_in_position(i, j);
			var analogue = get_analogue_accidental(note_pos);
			var original_filter_list = scale.filter(item => item.note == note_pos);
			var analogue_filter_list = scale.filter(item => item.note == analogue);
			if(original_filter_list.length > 0) {
				note_content = original_filter_list[0];
			} else if(analogue_filter_list.length > 0) {
				note_content = analogue_filter_list[0];
			}
			fretboard[i][j] = note_content;
		}
	}
	return fretboard;
}
