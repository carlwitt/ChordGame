/* ------------------------------------------------------------------------
 * Data
 * ------------------------------------------------------------------------ */

// used as keys to acces mode-related information
const modes = ['major', 'minor'];

const FLAT_SYMBOL = '♭'; // b ♭
const SHARP_SYMBOL = '♯'; // # ♯

const baseNotes = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];

// 13 keys, one for each key on the piano plus the enharmonic equivalent of G♭ (= F♯)
const keys = {
	'major': {
		//           0  1  2  3  4  5  6  7  8  9  10 11 12
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

const keysToNotes = [
	/*0*/ ['B'+SHARP_SYMBOL, 'C'],
	/*1*/ ['C'+SHARP_SYMBOL, 'D'+FLAT_SYMBOL],
	/*2*/ ['D'],
	/*3*/ ['D'+SHARP_SYMBOL, 'E'+FLAT_SYMBOL],
	/*4*/ ['E', 'F'+FLAT_SYMBOL],
	/*5*/ ['E'+SHARP_SYMBOL, 'F'],
	/*6*/ ['F'+SHARP_SYMBOL, 'G'+FLAT_SYMBOL],
	/*7*/ ['G'],
	/*8*/ ['G'+SHARP_SYMBOL, 'A'+FLAT_SYMBOL],
	/*9*/ ['A'],
	/*10*/ ['A'+SHARP_SYMBOL, 'B'+FLAT_SYMBOL],
	/*11*/ ['B', 'C'+FLAT_SYMBOL]
]

/* ------------------------------------------------------------------------
 * Logical Functions
 * ------------------------------------------------------------------------ */

// generate random integer between 0 and an upper bound (exclusive)
function randInt(upperExclusive){
	return Math.floor(Math.random() * upperExclusive);
}

// takes a note name, e.g., "C#" and returns the enharmonic equivalent, e.g., "Db"
function enharmonicEquivalent(noteName){
	var baseNote = baseNotes.indexOf(noteName[0]);

	if(noteName.includes(SHARP_SYMBOL)) return baseNotes[baseNote+1] + FLAT_SYMBOL;
	if(noteName.includes(FLAT_SYMBOL)) return baseNotes[baseNote-1] + SHARP_SYMBOL;
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

function triad(key, mode){
	var baseNote = keys[mode].baseNote[key];
	var notes = [
		applyAccidental(key, baseNote),  // base
		addNote(key, baseNote, 2), 		 // third
		addNote(key, baseNote, 4),		 // fifth
		//,addNote(key, baseNote, 6)	 // seventh
	];

	return notes;
}

/**
 * 
 * @param {int} maxAccidentals the returned key has at most this many sharps or flats
 * @param {[int]} allowedInversions 
 */
function randomTriad(maxAccidentals, allowedInversions){
	var key = randInt(1 + maxAccidentals*2) + (6 - maxAccidentals);
	var mode = modes[randInt(2)];
	return {
		'key': key,
		'mode': mode,
		'inversion': allowedInversions[randInt(allowedInversions.length)],
		'chord': triad(key, mode)
	};
}

// returns the n-th inversion of the chord
// e.g., n = 1: first inversion C E G -> E G C
// e.g., n = 2: second inversion C E G -> G C E
function inversion(n, chord){
	var inverted = [...chord]; 
	for (var i = 0; i < n; i++) {
		// cycle the contents of the Array by appending the removed first element
		inverted.push(inverted.shift());
	}
	return inverted;
}

/**
 * Return the offsets of the keys on the keyboard that represent the given note names.
 * For instance:
 *  ['C', 'Eb', 'G'] -> [0, 3, 7]
 *  ['Gb', 'Bb', 'Db'] -> [6, 10, 1]
 *  ['F#', 'A#', 'C#'] -> [6, 10, 1]
 * 
 * @param {[String]} chord 
 */
function noteNamesToKeyIndices(chord){
	let result = [];
	for(const noteName of chord){
		for(let keyIndex = 0; keyIndex < 12; keyIndex++){
			if(keysToNotes[keyIndex].indexOf(noteName) > -1) result.push(keyIndex);
		}
	}
	return result;
}