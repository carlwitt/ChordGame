/* ------------------------------------------------------------------------
 * Data
 * ------------------------------------------------------------------------ */

// used as keys to acces mode-related information
const modes = ['major', 'minor'];

const FLAT_SYMBOL = 'b'; // ♭
const SHARP_SYMBOL = '#'; // ♯

const baseNotes = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];

// 13 keys, one for each key on the piano plus the enharmonic equivalent of G♭ (= F♯)
const keys = {
	'major': {
		//           G♭ D♭ A♭ E♭ B♭ F  C  G  D  A  E  B  F♯
		'baseNote': [4, 1, 5, 2, 6, 3, 0, 4, 1, 5, 2, 6, 3]
	},
	'minor': {
		//			 E♭ B♭ F  C  G  D  A  E  B  F♯ C♯ G♯ D♯
		'baseNote': [2, 6, 3, 0, 4, 1, 5, 2, 6, 3, 0, 4, 1]
	},
	'accidentals': {
		'sharp': [0, 0, 0, 0, 0, 0, 0, 1, 2, 3, 4, 5, 6],
		'flat':  [6, 5, 4, 3, 2, 1, 0, 0, 0, 0, 0, 0, 0]
	}
};

// the raised/lowered notes in order of their appearance in the circle of fifths
// e.g., if you have 3 sharps, take the first 3 elements of the sharps array to see which notes are raised
const accidentals = {
	//        f♯ c♯ g♯ d♯ a♯ e♯ b♯
	'sharp': [3, 0, 4, 1, 5, 2, 6],
	//        b♭ e♭ a♭ d♭ g♭ c♭ f♭
	'flat':  [6, 2, 5, 1, 4, 0, 3],
};

// in german, we want B -> H and B♭ -> B
const germanNames = function(englishName){return englishName.replace('B', 'H').replace('H'+FLAT_SYMBOL, 'B')};
const identity = function(name){return name};

const NAMING = {
	'german': {
		'suffix': {'major': '-Dur', 'minor': '-Moll'}, 
		'lowerCaseMinor': true, 
		'nameTranslator': germanNames},
	'english': {
		'suffix': {'major': ' major', 'minor': ' minor'}, 
		'lowerCaseMinor': false, 
		'nameTranslator': identity}
};

/* ------------------------------------------------------------------------
 * Functions
 * ------------------------------------------------------------------------ */

// generate random integer between 0 and an upper bound (exclusive)
function randInt(upperExclusive){
	return Math.floor(Math.random() * upperExclusive);
}

// returns the name of the note at the given base note offset (e.g., 0 = C, 1 = D ... 6 = B) 
// within the given key (e.g., 9 = A major)
// e.g., applyAccidental(9, 0) = 'C♯'
function applyAccidental(key, noteOffset){

	// e.g. [3, 0, 4] for f♯, c♯, g♯, in A major
	var numSharps = keys.accidentals.sharp[key];
	var sharps = accidentals.sharp.slice(0, numSharps);
	
	var numFlats = keys.accidentals.flat[key];
	var flats = accidentals.flat.slice(0, numFlats);
	
	// e.g. C
	var noteName = baseNotes[noteOffset];
	
	// append sharp or flat
	if(sharps.includes(noteOffset)) noteName += SHARP_SYMBOL;
	if(flats.includes(noteOffset)) noteName += FLAT_SYMBOL;
	
	return noteName;
}

// get base note that lies a certain number of steps above another base note in a certain key
// e.g., to find the third above A in A major, use addNote(9, 5, 2) which gives 0 (=C)
// so this doesn't yet consider accidentals
function addNote(key, noteOffset, steps){
	var note = (noteOffset + steps) % 7;
	return applyAccidental(key, note);
}

function chord(key, mode){
	var baseNote = keys[mode].baseNote[key];
	var notes = [
		applyAccidental(key, baseNote),  // base
		addNote(key, baseNote, 2), 		 // third
		addNote(key, baseNote, 4)		 // fifth
	];

	console.log(naming.nameTranslator(notes[0]) + naming.suffix[mode]);
	return notes.map(naming.nameTranslator);
}

function randomChord(){
	var mode = modes[randInt(2)];
	var key = randInt(13);
	return inversion(randInt(3), chord(mode, key));
}

// returns the n-th inversion of the chord
// e.g., n = 1: first inversion C E G -> E G C
// e.g., n = 2: second inversion C E G -> G C E
function inversion(n, chord){
	for (var i = 0; i < n; i++) {
		// cycle the contents of the array
		chord.push(chord.shift());
	}
	return chord;
}

/* ------------------------------------------------------------------------
 * Script
 * ------------------------------------------------------------------------ */

var naming = NAMING['german'];

// // for (var key = 0; key < 13; key++) {
// for (var inv = 0; inv < 3; inv++) {	
// 	console.log(inversion(inv, chord(7, 'major')).join(" "));	
// 	console.log(inversion(inv, chord(7, 'minor')).join(" "));
// 	console.log();
// }

//var mode = modes[randInt(2)];
//var key = randInt(13);

