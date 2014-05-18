var config = {
	NAME_TAG_WIDTH: 58,
	NAME_TAG_HEIGHT: 17.8,

	PAGE_WIDTH: 210,
	PAGE_HEIGHT: 297,

	NUM_COLUMNS: 3,
	NUM_ROWS: 15,
	NUM_TAGS_PER_PAGE: 15*3,

	FONT_FAMILY: ['Helvetica',''],
	FONT_SIZE: 12,
};

function keysrt(key,desc) {
  return function(a,b){
   return desc ? ~~(a[key] < b[key]) : ~~(a[key] > b[key]);
  }
}

//================================================================================================//

var Tag = function(i) {

	var self = this;

	var horizontal_padding = (config.PAGE_WIDTH - config.NUM_COLUMNS*config.NAME_TAG_WIDTH) / 4; 	// three rows, therefore 4 padding regions.
	var vertical_padding = (config.PAGE_HEIGHT - config.NUM_ROWS*config.NAME_TAG_HEIGHT) / 2; 		// no space between rows, so just top and bottom.

	row = ~~(i/3);	// ~~ truncates to int using bitwise magick.
	col = ~~(i%3);

	this.offset = {
		x: horizontal_padding + col*(horizontal_padding+config.NAME_TAG_WIDTH),
		y: vertical_padding + row*config.NAME_TAG_HEIGHT,
	};

	this.center = {
		x: self.offset.x + config.NAME_TAG_WIDTH/2,
		y: self.offset.y + config.NAME_TAG_HEIGHT/2,
	}

	this.print = function(pdf, person) {

		pdf.rect(this.offset.x, this.offset.y, config.NAME_TAG_WIDTH, config.NAME_TAG_HEIGHT, 'S');

		pdf.setFontSize(config.FONT_SIZE*2);
		var y = this.offset.y + config.NAME_TAG_HEIGHT/2;
		pdf.centeredText(person.first, this.center.x, y);
		
		pdf.setFontSize(config.FONT_SIZE);
		var y = this.offset.y + 3*config.NAME_TAG_HEIGHT/4;
		pdf.centeredText(person.last, this.center.x, y);


	};
};

var buildPDF = function(persons) {

	this.pdf = new jsPDF('portrait','mm','a4');

	this.pdf.setFont(config.FONT_FAMILY[0], config.FONT_FAMILY[1]);
	this.pdf.setFontSize(config.FONT_SIZE);

	persons = persons.sort(keysrt('first'));
	var numPages = Math.ceil(persons.length / config.NUM_TAGS_PER_PAGE);

	for (var page = 0; page < numPages; page++) {
		
		if (page != 0) {
			this.pdf.addPage();
		}

		var remainingTags = persons.length - config.NUM_TAGS_PER_PAGE*page;
		var tagsOnThisPage = Math.min(remainingTags, config.NUM_TAGS_PER_PAGE);

		for (var i=0; i<tagsOnThisPage; i++) {

			var person = persons[i + page*config.NUM_TAGS_PER_PAGE];
			var tag = new Tag(i);
			tag.print(this.pdf, person);
		}

	};

	$('iframe').attr('src', this.pdf.output('datauristring'));
	document.getElementById('pdf').style.display = 'inline';
};

//================================================================================================//

var csvToJSON = function(csv, callback) {

	// id, first, last
	var output = []
	var lines = csv.split(/(\r\n|\n|\r)/gm).slice(1);

	for (var i = 0; i < lines.length; i++) {
		var line = lines[i];
		if (line.trim().length == 0) {
			continue;
		}

		var elements = line.split(",");
		var obj = {
			id: elements[0],
			first: elements[1],
			last: elements[2],
		}
		output.push(obj);
	};

	callback(output);
}

//================================================================================================//

var dragndrop = function(onTextLoaded) {

	// Check for the various File API support.
	if (window.File && window.FileReader && window.FileList && window.Blob) {
		// Great success! All the File APIs are supported.
	} else {
		alert('The File APIs are not fully supported in this browser.');
	}

	function handleFileSelect(evt) {
	    evt.stopPropagation();
	    evt.preventDefault();

	    var csv = evt.dataTransfer.files[0];

	    var reader = new FileReader();
		reader.onload = function(e) {
			onTextLoaded(e.target.result);
		};
		reader.readAsText(csv);
	}

	function handleDragOver(evt) {
		evt.stopPropagation();
		evt.preventDefault();
		evt.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
	}

	// Setup the dnd listeners.
	var dropZone = document.getElementById('drop_zone');
	dropZone.addEventListener('dragover', handleDragOver, false);
	dropZone.addEventListener('drop', handleFileSelect, false);
};

//================================================================================================//

$(document).ready(function() {

	console.log('beginning ...');

	dragndrop( function(csv) {
		csvToJSON(csv, function(json) {
			buildPDF(json);
		});
	});
});

//var span = document.createElement('span');
//span.innerHTML = e.target.result;
//document.getElementById('list').insertBefore(span, null);	  