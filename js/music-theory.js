/* ------------------------------------------------------------------------
 * Data
 * ------------------------------------------------------------------------ */

// used as keys to acces mode-related information
const modes = ['major', 'minor'];

const FLAT_SYMBOL = '♭'; // b ♭
const SHARP_SYMBOL = '♯'; // # ♯
const DOUBLE_SHARP_SYMBOL = '𝄪';
const DOUBLE_FLAT_SYMBOL = '𝄫';

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

// The note names associated to the twelve distinct keys on the keyboard
const keysToNotes = [
	/*0*/ ['B♯', 'C', 'D𝄫'],
	/*1*/ ['B𝄪', 'C♯', 'D♭'],
	/*2*/ ['C𝄪', 'D', 'E𝄫'],
	/*3*/ ['D♯', 'E♭', 'F𝄫'],
	/*4*/ ['D𝄪', 'E', 'F♭'],
	/*5*/ ['E♯', 'F', 'G𝄫'],
	/*6*/ ['E𝄪', 'F♯', 'G♭'],
	/*7*/ ['F𝄪', 'G', 'A𝄫'],
	/*8*/ ['G♯', 'A♭'],
	/*9*/ ['G𝄪', 'A', 'B𝄫'],
	/*10*/ ['A♯', 'B♭', 'C𝄫'],
	/*11*/ ['A𝄪', 'B', 'C♭']
]

/* ------------------------------------------------------------------------
 * Logical Functions
 * ------------------------------------------------------------------------ */

// generate random integer between 0 and an upper bound (exclusive)
function randInt(upperExclusive){
	return Math.floor(Math.random() * upperExclusive);
}

function randElement(array){
	return array[randInt(array.length)];
}

/**
 * Cyclic array indexing for indices < 0 and for indices ≥ array.length.
 * E.g., cyclic([1,2,3], -1) -> 3
 * @param {[obj]} array 
 * @param {int} index 
 * @returns the element when cycling index times forwards or backwards through the array
 */
function cyclic(array, index){
	return array[(index + Math.abs(index) * array.length) % array.length];
}

/**
 * For instance, applyAccidental(9, 0) = apply accidental(A major, C) = 'C♯'
 * @param {int} key 0 ≤ key ≤ 12 where 0 corresponds to Gb and 12 corresponds to F#
 * @param {} noteOffset 0 ≤ noteOffset ≤ 6 where 0 = C, 1 = D ... 6 = B
 * @returns the name of the note at the given base note offset in the given key 
 */
function applyAccidental(key, noteOffset){
	// e.g., 3 sharps for A major
	var numSharps = keys.accidentals.sharp[key];
	// e.g. [3, 0, 4] for f♯, c♯, g♯, in A major
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

/**
 * @param {int} key 0 ≤ key ≤ 12 where 0 corresponds to Gb and 12 corresponds to F#
 * @param {string} either 'major' or 'minor' 
 * @returns the three notes that constitute the root position of the chord in the given key and mode.
 */
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
 * Generates three notes from a key, mode, and inversion according to the given limitations.
 * @param {int} maxFlats the returned key has at most this many flats
 * @param {int} maxSharps the returned key has at most this many sharps
 * @param {[string]} allowedModes 'major' or 'minor'
 * @param {[int]} allowedInversions 0, 1, or 2 for root position, 1st, and 2nd inversion 
 */
function randomTriad(maxFlats, maxSharps, allowedModes, allowedInversions){
	const numKeys = 1 + maxFlats + maxSharps; // number of keys that can be generated: C + sharp keys + flat keys
	const lowestKey = 6 - maxFlats; // key 0 represents Gb, key 1 represents Db, etc.
	const key = lowestKey + randInt(numKeys);

	const mode = randElement(allowedModes);
	return {
		'key': key,
		'mode': mode,
		'inversion': randElement(allowedInversions),
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