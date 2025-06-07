/**
 * Fretboard Renderer Module
 * Handles canvas drawing operations and fretboard rendering
 */

/**
 * Fills a rectangle on the current canvas.
 * @param {number} x - The x-coordinate of the top-left corner.
 * @param {number} y - The y-coordinate of the top-left corner.
 * @param {number} w - The width of the rectangle.
 * @param {number} h - The height of the rectangle.
 * @param {string} color - The fill color of the rectangle.
 */
function fill_rect(x, y, w, h, color) {
	var ctx = CurrentCtx();
	ctx.fillStyle = color;
	ctx.fillRect(x, y, w, h);
}

/**
 * Fills a circle on the current canvas.
 * @param {number} cx - The x-coordinate of the center of the circle.
 * @param {number} cy - The y-coordinate of the center of the circle.
 * @param {number} radius - The radius of the circle.
 * @param {string} color - The fill color of the circle.
 */
function fill_circle(cx, cy, radius, color) {
	var ctx = CurrentCtx();
	ctx.beginPath();
	ctx.arc(cx, cy, radius, 0, 2 * Math.PI, false);
	ctx.fillStyle = color;
	ctx.fill();
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
function create_fretboard(dx, dy, width, height, spacing_limits, thin_string_height, string_inc, start_fret, frets) {	start_fret = Number(start_fret);
	
	// Get string spacing scaling factor from UI slider
	var string_spacing_scale = parseFloat(document.getElementById("slider-string-spacing")?.value || 1.0);
	
	// Calculate dynamic string spacing
	var scaled_spacing_limits = spacing_limits * string_spacing_scale;
	var first_string_start = scaled_spacing_limits;
	var last_string_start = height - scaled_spacing_limits;
	var space_to_place_strings = height - scaled_spacing_limits * 2;
	var space_between_strings = space_to_place_strings / 5;
	var fret_space = width / frets;
	
	// Get scaling factors from UI sliders
	var marker_scale = parseFloat(document.getElementById("slider-marker-size")?.value || 1.0);
	var note_scale = parseFloat(document.getElementById("slider-note-size")?.value || 1.0);
	var fret_font_scale = parseFloat(document.getElementById("slider-fret-font-size")?.value || 1.0);
	var note_font_scale = parseFloat(document.getElementById("slider-note-font-size")?.value || 1.0);
		// Calculate dynamic sizes based on fretboard dimensions
	var base_size = Math.min(width / frets, height / 8); // Base size calculation
	var fret_marker_radius = Math.max(4, Math.min(30, base_size * 0.3 * marker_scale)); // Scale marker circles
	var note_radius = Math.max(6, Math.min(36, base_size * 0.4 * note_scale)); // Scale note circles  
	var fret_number_font_size = Math.max(8, Math.min(32, base_size * 0.5 * fret_font_scale)); // Scale fret numbers
	var note_font_size = Math.max(8, Math.min(28, base_size * 0.4 * note_font_scale)); // Scale note text
	
	fill_rect(dx, dy, width, height, "#FEFFA2");

	for(var i = start_fret; i < start_fret + frets; i++) {
		fill_rect(dx + (i - start_fret) * fret_space, dy, 3, height, "#7E7E7E");
	}

	for(var i = 0; i < string_start_notes.length; i++) {
		string_height = thin_string_height + string_inc * i;
		startY = first_string_start + i * space_between_strings - string_height / 2;
		fill_rect(dx, dy + startY, width, string_height, "#B6B6B6");
	}

	function draw_fret_circle(fretnum, doble) {
		var circle_color = "#C4AF86"

		draw_fret_number(start_fret, fretnum);

		fretnum -= start_fret;
		if(fretnum > 0 && fretnum <= frets) {
			if(doble) {
				fill_circle(dx + fret_space * (fretnum - 1) + fret_space / 2, dy + 2 * height / 3, fret_marker_radius, circle_color);						
				fill_circle(dx + fret_space * (fretnum - 1) + fret_space / 2, dy + height / 3, fret_marker_radius, circle_color);						
			} else {
				fill_circle(dx + fret_space * (fretnum - 1) + fret_space / 2, dy + height / 2, fret_marker_radius, circle_color);										
			}
		}
	}

	function draw_fret_number(start_fret, fretnum) {
		var ctx = CurrentCtx();
		var prev_font = ctx.font;
		ctx.font = "bold " + fret_number_font_size + "px Arial";
		
		var fretnum2 = fretnum - start_fret;
		if(fretnum2 > 0 && fretnum2 <= frets) {
			draw_text(dx + fret_space * (fretnum2 - 1) + fret_space / 2, dy + height + 15, fretnum);
		}
		
		ctx.font = prev_font;
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

	function draw_text(cx, cy, text) {
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
		},		render_scale: function(fretboard_array, render_method, start_fret, num_frets) {
			start_fret = Number(start_fret);
			var end_fret = start_fret + num_frets;
			var ignore_open = start_fret > 0;
			for(var i = 0; i < fretboard_array.length; i++) {
				for(var j = start_fret; j < Math.min(end_fret, fretboard_array[i].length); j++) {
					var item = fretboard_array[i][j];
					var note = item["note"];
					var interval = item["interval"];
					if(note !== undefined) {
						this.draw_note(i, j - start_fret, item[render_method], intervals_colors[interval], ignore_open);
					}
				}
			}
		},		draw_note: function (string, fret, text, color, ignore_open) {
			if(fret == 0 && ignore_open) {
				return;
			}

			var ctx = CurrentCtx();
			var prev_font = ctx.font;
			ctx.font = "bold " + note_font_size + "px Arial";
			
			var position = this.get_note_position(string, fret);
			if(color === undefined) {
				color = "black";
			}
			var defx = dx + position[0];
			if(fret == 0) {
				defx = dx - 15;
			}
			fill_circle(defx, dy + position[1], note_radius, color);
			ctx.fillStyle = "white";
			ctx.textAlign = "center";
			ctx.textBaseline = "middle";
			ctx.fillText(text, defx, dy + position[1]);
			
			ctx.font = prev_font;
		}
	};
}

/**
 * Generates and renders the fretboard based on current UI selections.
 */
function generate() {
	var fretcanvas = document.getElementById("fretcanvas" + currentCanvas);
	fretcanvas.width = Number(document.getElementById("txt-canvas-width").value);

	var start_fret = Number(document.getElementById("txt-starting-fret").value);
	var end_fret = Number(document.getElementById("txt-ending-fret").value);
	
	// Calculate number of frets for the fretboard display
	var num_frets = end_fret - start_fret;
	
	// Adjust start_fret for display (subtract 1 if not starting from open strings)
	var display_start_fret = start_fret;
	if(start_fret > 0) {
		display_start_fret = start_fret - 1;
	}

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
	var name;	var ctx = CurrentCtx();
	
	// Get title font scaling factor from UI slider
	var title_font_scale = parseFloat(document.getElementById("slider-title-font-size")?.value || 1.0);
		// Calculate dynamic title font size based on canvas width
	var canvas_width = ctx.canvas.width;
	var title_font_size = Math.max(12, Math.min(96, canvas_width * 0.04 * title_font_scale)); // Scale title font
	var base_font_size = Math.max(8, Math.min(36, canvas_width * 0.016)); // Scale base font
	
	ctx.font = "bold " + base_font_size + "px Arial";

	ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
	var fretboard = create_fretboard(40, 50, ctx.canvas.width - 50, 200, 15, 1, 1, display_start_fret, num_frets);

	if(custom_formula.length > 1) {
		name = selected_note + " " + custom_formula_txt;
		scale = generate_scale(end_fret + 1, selected_note, custom_formula);
	} else {
		name = selected_note + " " + selected_item.text;
		scale = generate_scale(end_fret + 1, selected_note, data_formula);
	}

	var prev_style = ctx.font;
	ctx.font = "bold " + title_font_size + "px Arial";
	ctx.fillStyle = "black";
	ctx.textAlign = "left";
	ctx.textBaseline = "middle";
	ctx.fillText(name, 30, 30);
	ctx.font = prev_style;
	fretboard.render_scale(scale, selected_render, display_start_fret, num_frets);

	loadOrSaveCurrent(true);
	// Auto-save after generating
	autoSave();
}
