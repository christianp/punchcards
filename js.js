function Punchcard(num_rows,num_holes) {
	this.num_rows = num_rows;
	this.num_holes = num_holes;
	this.rows = ko.observableArray([]);
	for(var i=0;i<this.num_rows;i++) {
		this.rows.push(new Row(this.num_holes));
	}
	this.value = ko.computed(function() {
		return this.rows().map(function(r){return r.letter()}).join('');
	},this);
}
Punchcard.prototype = {
	clear: function() {
		this.rows().map(function(row) {
			row.clear();
		});
	}
}

function Row(num_holes) {
	this.num_holes = num_holes;
	this.holes = ko.observableArray([]);
	for(var i=0;i<this.num_holes;i++) {
		this.holes.push(new Hole());
	}
	this.value = ko.computed(function() {
		var t = 0;
		this.holes().forEach(function(hole,i) {
			if(hole.punched()) {
				t += Math.pow(2,i);
			}
		})
		return t;
	},this);

	this.letter = ko.computed(function() {
		var v = this.value();
		if(v==0) { 
			return '';
		}
		return String.fromCharCode(v);
	},this)
}
Row.prototype = {
	set_value: function(n) {
		for(var i=0;i<this.num_holes;i++) {
			var p = Math.pow(2,i);
			this.holes()[i].punched(p & n);
		}
	},
	clear: function() {
		this.holes().forEach(function(h) {
			h.punched(false);
		});
	}
}
function Hole() {
	var h = this;
	this.punched = ko.observable(false);
	this.toggle = function() {
		h.punched(!h.punched());
	}
}


function Program() {
	this.punchcards = ko.observableArray([]);
	ko.computed(function() {
		var punchcards = this.punchcards();
		if(punchcards.length==0 || punchcards[punchcards.length-1].value().trim()!='') {
			var pc =this.add_card();
			pc.value();
			return;
		} 
	},this);
	this.program = ko.computed(function() {
		return this.punchcards().map(function(pc) {
			return pc.value();
		}).join('');
	},this);
}
Program.prototype = {
	add_card: function() {
		var pc = new Punchcard(12,10);
		this.punchcards.push(pc);    
		return pc;
	},
	clear: function() {
		this.punchcards([]);
	},
	set_program: function(program) {
		this.clear();
		var punchcards = this.punchcards();

		var pi = 0;
		var ci = 0;
		var r = 0;
		for(pi=0;pi<program.length;pi++) {
			var n = program.charCodeAt(pi);
			var row = punchcards[ci].rows()[r];
			row.set_value(n);

			r += 1;
			if(r==punchcards[ci].num_rows) {
				r = 0;
				ci += 1;
				if(ci==punchcards.length) {
					this.punchcards.push(this.add_card());
					punchcards = this.punchcards();
				}
			}
		}
	}
}

var program = new Program();
program.set_program('hello world');
ko.applyBindings(program);

var codes_table = document.getElementById('codes');
for(var i=0;i<128/4;i++) {
	var tr = document.createElement('tr');
	for(var j=i;j<128;j+=128/4) {
		var td_number = document.createElement('td');
		td_number.innerText = j;
		td_number.classList.add('number');
		var td_character =  document.createElement('td');
		td_character.classList.add('character');
		td_character.innerText = String.fromCharCode(j);
		tr.appendChild(td_number);
		tr.appendChild(td_character);
		codes_table.appendChild(tr);
	}
}
